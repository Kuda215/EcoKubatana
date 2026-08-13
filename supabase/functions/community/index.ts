// ============================================
// COMMUNITY BOARD EDGE FUNCTION
// ============================================
// Deploy this to Supabase Edge Functions
// Name: community
//
// Handles all community board operations
//
// Endpoints:
// GET    /community/posts           - List all posts
// POST   /community/posts           - Create new post
// POST   /community/posts/:id/like  - Toggle like on post
// POST   /community/posts/:id/comment - Add comment to post
// GET    /community/stats           - Get community stats
// GET    /community/leaderboard     - Get top contributors

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && user) {
        userId = user.id;
      }
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // GET /community/posts - List all posts with author info
    if (req.method === 'GET' && pathParts[1] === 'posts') {
      const { category } = Object.fromEntries(url.searchParams);
      
      let query = supabase
        .from('community_posts')
        .select(`
          *,
          author:profiles!author_id (
            id,
            name,
            role
          )
        `)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      // Filter by category
      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      const { data: posts, error } = await query;

      if (error) throw error;

      // Get user's likes for these posts
      let userLikes: string[] = [];
      if (userId && posts && posts.length > 0) {
        const postIds = posts.map(p => p.id);
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', postIds);
        
        userLikes = likes?.map(l => l.post_id) || [];
      }

      // Get comments for each post
      const postsWithData = await Promise.all(posts.map(async (post) => {
        const { data: comments } = await supabase
          .from('post_comments')
          .select(`
            *,
            author:profiles!author_id (
              id,
              name
            )
          `)
          .eq('post_id', post.id)
          .order('created_at', { ascending: true });

        return {
          ...post,
          likedByUser: userLikes.includes(post.id),
          comments: comments || [],
        };
      }));

      return new Response(
        JSON.stringify({ success: true, data: postsWithData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /community/posts - Create new post
    if (req.method === 'POST' && pathParts[1] === 'posts' && pathParts.length === 2) {
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();
      const { content, category, image_urls = [] } = body;

      if (!content || !category) {
        return new Response(
          JSON.stringify({ success: false, error: 'Content and category required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get default community ID
      const { data: community } = await supabase
        .from('communities')
        .select('id')
        .eq('name', 'EcoKubatana Zimbabwe')
        .single();

      if (!community) {
        return new Response(
          JSON.stringify({ success: false, error: 'Community not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          community_id: community.id,
          author_id: userId,
          content,
          category,
          image_urls,
        })
        .select(`
          *,
          author:profiles!author_id (
            id,
            name,
            role
          )
        `)
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data: { ...data, likedByUser: false, comments: [] } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /community/posts/:id/like - Toggle like
    if (req.method === 'POST' && pathParts[1] === 'posts' && pathParts[3] === 'like') {
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const postId = pathParts[2];

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, liked: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: userId });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, liked: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // POST /community/posts/:id/comment - Add comment
    if (req.method === 'POST' && pathParts[1] === 'posts' && pathParts[3] === 'comment') {
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const postId = pathParts[2];
      const body = await req.json();
      const { content } = body;

      if (!content) {
        return new Response(
          JSON.stringify({ success: false, error: 'Comment content required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          author_id: userId,
          content,
        })
        .select(`
          *,
          author:profiles!author_id (
            id,
            name
          )
        `)
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /community/stats - Get community statistics
    if (req.method === 'GET' && pathParts[1] === 'stats') {
      const { data: community } = await supabase
        .from('communities')
        .select('member_count, post_count')
        .eq('name', 'EcoKubatana Zimbabwe')
        .single();

      const { count: activeMembers } = await supabase
        .from('community_members')
        .select('*', { count: 'exact', head: true })
        .gte('points', 10);

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            totalMembers: community?.member_count || 0,
            totalPosts: community?.post_count || 0,
            activeMembers: activeMembers || 0,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /community/leaderboard - Get top contributors
    if (req.method === 'GET' && pathParts[1] === 'leaderboard') {
      const { data: community } = await supabase
        .from('communities')
        .select('id')
        .eq('name', 'EcoKubatana Zimbabwe')
        .single();

      if (!community) {
        return new Response(
          JSON.stringify({ success: false, error: 'Community not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: leaderboard, error } = await supabase
        .from('community_members')
        .select(`
          points,
          post_count,
          user:profiles!user_id (
            id,
            name
          )
        `)
        .eq('community_id', community.id)
        .order('points', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Format leaderboard with ranks and badges
      const formattedLeaderboard = leaderboard.map((member, index) => ({
        rank: index + 1,
        name: member.user?.name || 'Anonymous',
        points: member.points,
        posts: member.post_count,
        badge: index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐',
        medalClass: index === 0 ? 'medal--gold' : index === 1 ? 'medal--silver' : index === 2 ? 'medal--bronze' : '',
      }));

      return new Response(
        JSON.stringify({ success: true, data: formattedLeaderboard }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route not found
    return new Response(
      JSON.stringify({ success: false, error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
