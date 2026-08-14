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

// ══════════════════════════════════════════
// ALERTS API
// ══════════════════════════════════════════

export const alertsAPI = {
  // Get alerts. Pass { status: 'pending' } for the admin review queue,
  // omit for the public published feed.
  async list(params = {}) {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams(params).toString();

    const response = await fetch(`${EDGE_FUNCTION_URL}/alerts${query ? `?${query}` : ''}`, {
      headers,
    });
    return response.json();
  },

  // Propose a new alert (any authenticated user) - stays pending until an admin publishes it
  async create(alertData) {
    const headers = await getAuthHeaders();

    const response = await fetch(`${EDGE_FUNCTION_URL}/alerts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(alertData),
    });
    return response.json();
  },

  // Publish a pending alert (admin only) - triggers SMS/WhatsApp
  async publish(alertId) {
    const headers = await getAuthHeaders();

    const response = await fetch(`${EDGE_FUNCTION_URL}/alerts/${alertId}/publish`, {
      method: 'PUT',
      headers,
    });
    return response.json();
  },

  // Reject a pending alert (admin only) - no messaging
  async reject(alertId) {
    const headers = await getAuthHeaders();

    const response = await fetch(`${EDGE_FUNCTION_URL}/alerts/${alertId}/reject`, {
      method: 'PUT',
      headers,
    });
    return response.json();
  },

  // Subscribe a phone number to alerts
  async subscribe(phone) {
    const headers = await getAuthHeaders();

    const response = await fetch(`${EDGE_FUNCTION_URL}/alerts/subscribe`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ phone }),
    });
    return response.json();
  },
};

// ══════════════════════════════════════════
// AI ASSISTANT API
// ══════════════════════════════════════════

export const aiAssistantAPI = {
  // Send the full message history so far and get the assistant's reply.
  // messages: [{ role: 'user' | 'assistant', content: string }, ...]
  async chat(messages) {
    const headers = await getAuthHeaders();

    const response = await fetch(`${EDGE_FUNCTION_URL}/ai-assistant`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ messages }),
    });
    return response.json();
  },
};

// ══════════════════════════════════════════
// FAQS API
// ══════════════════════════════════════════
// Plain CRUD fully expressed by RLS (authenticated read, admin-only write) -
// talks to Supabase directly instead of going through an edge function.

export const faqsAPI = {
  async list() {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  async create({ question, answer, display_order = 0 }) {
    const { data, error } = await supabase
      .from('faqs')
      .insert({ question, answer, display_order })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  async update(id, { question, answer, display_order }) {
    const { data, error } = await supabase
      .from('faqs')
      .update({ question, answer, display_order })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  async remove(id) {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};

// ══════════════════════════════════════════
// VIDEOS API
// ══════════════════════════════════════════
// Plain CRUD fully expressed by RLS (authenticated read, admin-only write) -
// talks to Supabase directly instead of going through an edge function.

export const videosAPI = {
  async list() {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  async create({ title, youtube_url, category = 'General', duration = '', emoji = '🎥', display_order = 0 }) {
    const { data, error } = await supabase
      .from('videos')
      .insert({ title, youtube_url, category, duration, emoji, display_order })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  async update(id, { title, youtube_url, category, duration, emoji, display_order }) {
    const { data, error } = await supabase
      .from('videos')
      .update({ title, youtube_url, category, duration, emoji, display_order })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  async remove(id) {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};

// ══════════════════════════════════════════
// HELP REQUESTS API
// ══════════════════════════════════════════
// Plain CRUD fully expressed by RLS (own-row create/read, admin read/update all) -
// talks to Supabase directly instead of going through an edge function.

export const helpRequestsAPI = {
  // Submit a help request as the current user
  async create({ type, priority, location, description }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'You must be signed in to request help.' };

    const { data, error } = await supabase
      .from('help_requests')
      .insert({ user_id: user.id, type, priority, location, description })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  // Admin: list all help requests (own requests only, for non-admins)
  async list() {
    const { data, error } = await supabase
      .from('help_requests')
      .select('*, profiles!help_requests_user_id_fkey(name, phone, location)')
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  // Admin: mark a request as being handled by the current admin
  async respond(id) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('help_requests')
      .update({ status: 'assigned', assigned_to: user?.id })
      .eq('id', id)
      .select('*, profiles!help_requests_user_id_fkey(name, phone, location)')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  // Admin: mark a request resolved
  async resolve(id) {
    const { data, error } = await supabase
      .from('help_requests')
      .update({ status: 'resolved' })
      .eq('id', id)
      .select('*, profiles!help_requests_user_id_fkey(name, phone, location)')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },
};

// ══════════════════════════════════════════
// ADMIN STATS API
// ══════════════════════════════════════════
// Lightweight real counts for the AdminPortal Overview cards.

export const adminStatsAPI = {
  async getMemberCounts() {
    const { data, error } = await supabase.rpc('get_member_counts');
    if (error) return { success: false, error: error.message };

    const row = Array.isArray(data) ? data[0] : data;
    return {
      success: true,
      data: {
        totalMembers: row?.total_members || 0,
        totalVolunteers: row?.total_volunteers || 0,
      },
    };
  },
};

// ══════════════════════════════════════════
// NOTIFICATIONS API
// ══════════════════════════════════════════
// Tracks when the current user last opened the bell dropdown, so the badge
// can show a real unread count instead of a hardcoded number.

export const notificationsAPI = {
  async getLastSeenAlertsAt() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not signed in' };

    const { data, error } = await supabase
      .from('notification_state')
      .select('last_seen_alerts_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data?.last_seen_alerts_at || '1970-01-01T00:00:00Z' };
  },

  async markAlertsSeen() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not signed in' };

    const now = new Date().toISOString();
    const { error } = await supabase
      .from('notification_state')
      .upsert({ user_id: user.id, last_seen_alerts_at: now }, { onConflict: 'user_id' });

    if (error) return { success: false, error: error.message };
    return { success: true, data: now };
  },
};
