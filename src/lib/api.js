// ============================================
// API UTILITY
// ============================================
// Helper functions for calling Supabase Edge Functions
// This handles authentication and CORS automatically

import { supabase } from './supabaseClient';

const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL?.replace(
  'https://',
  'https://'
).replace('.supabase.co', '.supabase.co/functions/v1');

console.log('🔧 API Configuration:');
console.log('  VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('  Edge Function URL:', EDGE_FUNCTION_URL);
console.log('  Supabase Client:', supabase ? 'Initialized ✅' : 'Not initialized ❌');

// Helper to get auth headers
async function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (!supabase) {
    console.warn('Supabase client not initialized');
    return headers;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.error('Error getting auth session:', error);
  }

  return headers;
}

// ══════════════════════════════════════════
// INCIDENTS API
// ══════════════════════════════════════════

export const incidentsAPI = {
  // Get all incidents
  async list(filters = {}) {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams(filters).toString();
      const url = `${EDGE_FUNCTION_URL}/incidents${params ? `?${params}` : ''}`;
      
      console.log('Fetching incidents from:', url);
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        console.error('Incidents API error:', response.status, response.statusText);
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}`, data: [] };
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching incidents:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Create new incident
  async create(incidentData) {
    try {
      console.log('Creating incident with data:', incidentData);
      const headers = await getAuthHeaders();
      const url = `${EDGE_FUNCTION_URL}/incidents`;
      
      console.log('Posting to:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(incidentData),
      });
      
      if (!response.ok) {
        console.error('Create incident error:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || `HTTP ${response.status}` };
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating incident:', error);
      return { success: false, error: error.message };
    }
  },

  // Verify incident (admin only)
  async verify(incidentId) {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${EDGE_FUNCTION_URL}/incidents/${incidentId}/verify`, {
      method: 'PUT',
      headers,
    });
    return response.json();
  },

  // Reject incident (admin only)
  async reject(incidentId) {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${EDGE_FUNCTION_URL}/incidents/${incidentId}/reject`, {
      method: 'PUT',
      headers,
    });
    return response.json();
  },

  // Resolve incident (admin only)
  async resolve(incidentId) {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${EDGE_FUNCTION_URL}/incidents/${incidentId}/resolve`, {
      method: 'PUT',
      headers,
    });
    return response.json();
  },

  // Delete incident (admin only)
  async delete(incidentId) {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${EDGE_FUNCTION_URL}/incidents/${incidentId}`, {
      method: 'DELETE',
      headers,
    });
    return response.json();
  },
};

// ══════════════════════════════════════════
// COMMUNITY API
// ══════════════════════════════════════════

export const communityAPI = {
  // Get all posts
  async getPosts(category = null) {
    try {
      const headers = await getAuthHeaders();
      const params = category && category !== 'All' ? `?category=${category}` : '';
      const url = `${EDGE_FUNCTION_URL}/community/posts${params}`;
      
      console.log('Fetching community posts from:', url);
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        console.error('Community posts API error:', response.status, response.statusText);
        return { success: false, error: `HTTP ${response.status}`, data: [] };
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching community posts:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Create new post
  async createPost(postData) {
    try {
      const headers = await getAuthHeaders();
      const url = `${EDGE_FUNCTION_URL}/community/posts`;
      
      console.log('Creating post:', postData);
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        console.error('Create post error:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || `HTTP ${response.status}` };
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating post:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle like on post
  async toggleLike(postId) {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${EDGE_FUNCTION_URL}/community/posts/${postId}/like`, {
      method: 'POST',
      headers,
    });
    return response.json();
  },

  // Add comment to post
  async addComment(postId, content) {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${EDGE_FUNCTION_URL}/community/posts/${postId}/comment`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content }),
    });
    return response.json();
  },

  // Get community statistics
  async getStats() {
    try {
      const headers = await getAuthHeaders();
      const url = `${EDGE_FUNCTION_URL}/community/stats`;
      
      console.log('Fetching community stats from:', url);
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        console.error('Community stats API error:', response.status, response.statusText);
        return { success: false, error: `HTTP ${response.status}`, data: { totalMembers: 0, totalPosts: 0, activeMembers: 0 } };
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching community stats:', error);
      return { success: false, error: error.message, data: { totalMembers: 0, totalPosts: 0, activeMembers: 0 } };
    }
  },

  // Get leaderboard
  async getLeaderboard() {
    try {
      const headers = await getAuthHeaders();
      const url = `${EDGE_FUNCTION_URL}/community/leaderboard`;
      
      console.log('Fetching leaderboard from:', url);
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        console.error('Leaderboard API error:', response.status, response.statusText);
        return { success: false, error: `HTTP ${response.status}`, data: [] };
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return { success: false, error: error.message, data: [] };
    }
  },
};
