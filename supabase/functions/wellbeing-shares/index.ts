// ============================================
// WELLBEING SHARES EDGE FUNCTION
// ============================================
// Deploy this to Supabase Edge Functions
// Name: wellbeing-shares
//
// Handles all anonymous wellbeing share operations
//
// Endpoints:
// GET    /wellbeing-shares
// GET    /wellbeing-shares?include_hidden=true
// POST   /wellbeing-shares
// POST   /wellbeing-shares/:id/support
// POST   /wellbeing-shares/:id/flag
// POST   /wellbeing-shares/:id/unflag
// POST   /wellbeing-shares/:id/hide
// POST   /wellbeing-shares/:id/unhide
//

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Server configuration error',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    const functionIndex = pathParts.indexOf('wellbeing-shares');
    const routeParts = functionIndex >= 0
      ? pathParts.slice(functionIndex + 1)
      : [];

    // GET /wellbeing-shares - List all anonymous wellbeing shares
    if (req.method === 'GET' && routeParts.length === 0) {
      const { limit: limitParam, include_hidden } =
        Object.fromEntries(url.searchParams);

      const includeHidden = include_hidden === 'true';

      let limit = Number(limitParam) || 20;
      limit = Math.max(1, Math.min(limit, 100));

      let query = supabase
        .from('wellbeing_shares')
        .select(
          'id, content, created_at, support_count, is_flagged, is_hidden'
        )
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!includeHidden) {
        query = query.eq('is_hidden', false);
      }

      const { data: shares, error } = await query;

      if (error) throw error;

      const formattedShares = (shares ?? []).map((share) => ({
        id: share.id,
        content: share.content,
        created_at: share.created_at,
        support_count: share.support_count ?? 0,
        reported: share.is_flagged === true,
        is_hidden: share.is_hidden === true,
      }));

      return new Response(
        JSON.stringify({ success: true, data: formattedShares }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /wellbeing-shares - Create anonymous wellbeing share
    if (req.method === 'POST' && routeParts.length === 0) {
      let body;

      try {
        body = await req.json();
      } catch {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid JSON body',
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { content } = body;

      if (typeof content !== 'string' || !content.trim()) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Content required',
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const cleanedContent = content.trim();

      if (cleanedContent.length > 2000) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Content must be 2000 characters or less',
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data, error } = await supabase
        .from('wellbeing_shares')
        .insert({
          content: cleanedContent,
          support_count: 0,
          is_flagged: false,
          is_hidden: false,
        })
        .select(
          'id, content, created_at, support_count, is_flagged, is_hidden'
        )
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: data.id,
            content: data.content,
            created_at: data.created_at,
            support_count: data.support_count ?? 0,
            reported: data.is_flagged === true,
            is_hidden: data.is_hidden === true,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /wellbeing-shares/:id/support - Add support to share
    if (
      req.method === 'POST' &&
      routeParts.length === 2 &&
      routeParts[1] === 'support'
    ) {
      const shareId = routeParts[0];

      const { data: current, error: fetchError } = await supabase
        .from('wellbeing_shares')
        .select('id, support_count')
        .eq('id', shareId)
        .single();

      if (fetchError || !current) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Share not found',
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const newSupportCount = (current.support_count ?? 0) + 1;

      const { data, error } = await supabase
        .from('wellbeing_shares')
        .update({ support_count: newSupportCount })
        .eq('id', shareId)
        .select('id, support_count')
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /wellbeing-shares/:id/flag - Flag a share
    if (
      req.method === 'POST' &&
      routeParts.length === 2 &&
      routeParts[1] === 'flag'
    ) {
      const shareId = routeParts[0];

      const { data: existingShare, error: fetchError } = await supabase
        .from('wellbeing_shares')
        .select('id, is_flagged')
        .eq('id', shareId)
        .single();

      if (fetchError || !existingShare) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Share not found',
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (existingShare.is_flagged === true) {
        return new Response(
          JSON.stringify({
            success: true,
            alreadyReported: true,
            data: {
              id: shareId,
              reported: true,
            },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('wellbeing_shares')
        .update({ is_flagged: true })
        .eq('id', shareId)
        .select('id, is_flagged')
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          alreadyReported: false,
          data: {
            id: data.id,
            reported: data.is_flagged === true,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /wellbeing-shares/:id/unflag - Remove flag from share
    if (
      req.method === 'POST' &&
      routeParts.length === 2 &&
      routeParts[1] === 'unflag'
    ) {
      const shareId = routeParts[0];

      const { data: existingShare, error: fetchError } = await supabase
        .from('wellbeing_shares')
        .select('id')
        .eq('id', shareId)
        .single();

      if (fetchError || !existingShare) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Share not found',
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data, error } = await supabase
        .from('wellbeing_shares')
        .update({ is_flagged: false })
        .eq('id', shareId)
        .select('id, is_flagged, is_hidden')
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: data.id,
            reported: data.is_flagged === true,
            is_hidden: data.is_hidden === true,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /wellbeing-shares/:id/hide - Hide a share
    if (
      req.method === 'POST' &&
      routeParts.length === 2 &&
      routeParts[1] === 'hide'
    ) {
      const shareId = routeParts[0];

      const { data: existingShare, error: fetchError } = await supabase
        .from('wellbeing_shares')
        .select('id')
        .eq('id', shareId)
        .single();

      if (fetchError || !existingShare) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Share not found',
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data, error } = await supabase
        .from('wellbeing_shares')
        .update({ is_hidden: true })
        .eq('id', shareId)
        .select('id, is_flagged, is_hidden')
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: data.id,
            reported: data.is_flagged === true,
            is_hidden: data.is_hidden === true,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /wellbeing-shares/:id/unhide - Unhide a share
    if (
      req.method === 'POST' &&
      routeParts.length === 2 &&
      routeParts[1] === 'unhide'
    ) {
      const shareId = routeParts[0];

      const { data: existingShare, error: fetchError } = await supabase
        .from('wellbeing_shares')
        .select('id')
        .eq('id', shareId)
        .single();

      if (fetchError || !existingShare) {
        return new Response(
           JSON.stringify({
            success: false,
            error: 'Share not found',
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data, error } = await supabase
        .from('wellbeing_shares')
        .update({ is_hidden: false })
        .eq('id', shareId)
        .select('id, is_flagged, is_hidden')
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          data: {
              id: data.id,
            reported: data.is_flagged === true,
            is_hidden: data.is_hidden === true,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route not found
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Route not found',
        path: url.pathname,
      }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});