// ============================================
// INCIDENTS EDGE FUNCTION
// ============================================
// Deploy this to Supabase Edge Functions
// Name: incidents
// 
// Handles all incident operations: list, create, verify, reject, delete
//
// Endpoints:
// GET    /incidents              - List all incidents (public)
// POST   /incidents              - Create new incident
// PUT    /incidents/:id/verify   - Verify incident (admin only)
// PUT    /incidents/:id/reject   - Reject incident (admin only) 
// DELETE /incidents/:id          - Delete incident (admin only)

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
    let userRole: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && user) {
        userId = user.id;
        // Get user role from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        userRole = profile?.role || 'member';
      }
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // GET /incidents - List all incidents
    if (req.method === 'GET' && pathParts.length === 1) {
      const { type, status, severity, mine } = Object.fromEntries(url.searchParams);
      
      let query = supabase
        .from('incidents')
        .select('*')
        .order('reported_at', { ascending: false });

      // Apply filters
      if (type && type !== 'All') {
        query = query.eq('type', type);
      }
      if (status && status !== 'All') {
        query = query.eq('status', status);
      }
      if (severity) {
        query = query.eq('severity', severity);
      }

      if (mine === '1' && userId) {
        query = query.eq('reporter_id', userId);
      } else if (userRole !== 'admin') {
        query = query.in('status', ['active', 'verified', 'resolved', 'investigating']);
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /incidents - Create new incident
    if (req.method === 'POST' && pathParts.length === 1) {
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();
      const {
        title,
        type,
        location,
        description,
        severity = 'medium',
        reporter_name,
        reporter_contact,
        image_url,
        affected_count = 0,
      } = body;

      // Validate required fields
      if (!title || !type || !location || !description) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('incidents')
        .insert({
          title,
          type,
          location,
          description,
          severity,
          status: 'pending',
          reporter_id: userId,
          reporter_name: reporter_name || 'Anonymous',
          reporter_contact,
          image_url,
          affected_count,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /incidents/recommend — live Open-Meteo check for type + place
    if (req.method === 'POST' && pathParts[pathParts.length - 1] === 'recommend') {
      const body = await req.json();
      const type = body.type || 'Other';
      const location = body.location || '';
      let lat = body.lat;
      let lng = body.lng;
      if (lat == null || lng == null) {
        const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
        const gj = await geo.json();
        lat = gj.results?.[0]?.latitude;
        lng = gj.results?.[0]?.longitude;
      }
      if (lat == null) {
        return new Response(JSON.stringify({ success: true, data: { likely: false, reason: 'Could not place this report on the map.', liveHazard: 'Unknown' } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const wxRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,precipitation_sum,precipitation_probability_max&forecast_days=7&timezone=auto`);
      const wx = await wxRes.json();
      const precip = (wx.daily?.precipitation_sum || []).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
      const maxT = Math.max(0, ...(wx.daily?.temperature_2m_max || [0]).map(Number));
      let liveHazard = 'Stable';
      if (precip >= 40) liveHazard = 'Flood';
      else if (precip <= 5 && maxT >= 32) liveHazard = 'Drought';
      else if (maxT >= 36) liveHazard = 'Heat';
      const floodType = type === 'Flood' || type === 'Landslide' || type === 'Strong Winds';
      const likely = (floodType && liveHazard === 'Flood') || (type === 'Drought' && liveHazard === 'Drought') || (type === 'Heatwave' && (liveHazard === 'Heat' || liveHazard === 'Drought'));
      return new Response(JSON.stringify({
        success: true,
        data: {
          likely,
          liveHazard,
          reason: likely
            ? `Open-Meteo around this place this week leans ${liveHazard} (${Math.round(precip)} mm rain, ${Math.round(maxT)}°C). This ${type} report fits the area.`
            : `Open-Meteo around this place this week leans ${liveHazard}. A ${type} report is a weak match — check before publishing.`,
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // PUT /incidents/:id/verify - Verify incident
    if (req.method === 'PUT' && pathParts.length === 3 && pathParts[2] === 'verify') {
      if (userRole !== 'admin') {
        return new Response(
          JSON.stringify({ success: false, error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const incidentId = pathParts[1];

      const { data, error } = await supabase.rpc('verify_incident', {
        incident_id: incidentId,
        admin_id: userId,
      });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT /incidents/:id/reject - Reject incident
    if (req.method === 'PUT' && pathParts.length === 3 && pathParts[2] === 'reject') {
      if (userRole !== 'admin') {
        return new Response(
          JSON.stringify({ success: false, error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const incidentId = pathParts[1];

      const { data, error } = await supabase.rpc('reject_incident', {
        incident_id: incidentId,
        admin_id: userId,
      });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT /incidents/:id/resolve - Resolve incident
    if (req.method === 'PUT' && pathParts.length === 3 && pathParts[2] === 'resolve') {
      if (userRole !== 'admin') {
        return new Response(
          JSON.stringify({ success: false, error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const incidentId = pathParts[1];

      const { data, error } = await supabase.rpc('resolve_incident', {
        incident_id: incidentId,
        admin_id: userId,
      });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /incidents/:id - Delete incident
    if (req.method === 'DELETE' && pathParts.length === 2) {
      if (userRole !== 'admin') {
        return new Response(
          JSON.stringify({ success: false, error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const incidentId = pathParts[1];

      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', incidentId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: 'Incident deleted' }),
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
