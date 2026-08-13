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

// Helper to get auth headers
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return headers;
}

// ══════════════════════════════════════════
// INCIDENTS API
// ══════════════════════════════════════════

export const incidentsAPI = {
  // Get all incidents
  async list(filters = {}) {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams(filters).toString();
    const url = `${EDGE_FUNCTION_URL}/incidents${params ? `?${params}` : ''}`;
    
    const response = await fetch(url, { headers });
    return response.json();
  },

  // Create new incident
  async create(incidentData) {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${EDGE_FUNCTION_URL}/incidents`, {
      method: 'POST',
      headers,
      body: JSON.stringify(incidentData),
    });
    return response.json();
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
    const headers = await getAuthHeaders();
    const params = category && category !== 'All' ? `?category=${category}` : '';
    
    const response = await fetch(`${EDGE_FUNCTION_URL}/community/posts${params}`, {
      headers,
    });
    return response.json();
  },

  // Create new post
  async createPost(postData) {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${EDGE_FUNCTION_URL}/community/posts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(postData),
    });
    return response.json();
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
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${EDGE_FUNCTION_URL}/community/stats`, {
      headers,
    });
    return response.json();
  },

  // Get leaderboard
  async getLeaderboard() {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${EDGE_FUNCTION_URL}/community/leaderboard`, {
      headers,
    });
    return response.json();
  },
};
