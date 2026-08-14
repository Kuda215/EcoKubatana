// ============================================
// ALERTS EDGE FUNCTION
// ============================================
// Deploy this to Supabase Edge Functions
// Name: alerts
//
// Handles alert propose/publish/reject + subscribe operations
//
// Endpoints:
// GET    /alerts               - List published alerts (public)
// GET    /alerts?status=pending - List pending alerts awaiting review (admin only)
// POST   /alerts                - Propose a new alert (any authenticated user) - status: pending
// PUT    /alerts/:id/publish    - Publish a pending alert (admin only) - sends SMS/WhatsApp
// PUT    /alerts/:id/reject     - Reject a pending alert (admin only) - no messaging
// POST   /alerts/subscribe      - Subscribe a phone number to alerts
//
// Requires these secrets set on the function (Dashboard -> Edge Functions -> Manage secrets):
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, TWILIO_WHATSAPP_NUMBER
//
// TWILIO_WHATSAPP_NUMBER is the Twilio WhatsApp Sandbox number (Console -> Messaging ->
// Try it out -> Send a WhatsApp message), e.g. "+14155238886". Sandbox mode: each
// recipient must first send the sandbox's "join <code>" message via WhatsApp before
// they can receive anything from it - fine for testing, not for real public users.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
};

// Twilio requires E.164 format (+27821234567) - strip everything except digits and a leading +
function normalizePhone(phone: string): string {
  const digits = phone.trim().replace(/\D/g, '');
  return `+${digits}`;
}

// Loose case-insensitive match between an alert's target area and a
// subscriber's profile location, in either direction (e.g. "Ferndale"
// matches "Ferndale, Johannesburg"). "All Areas" / empty area always matches.
function areaMatches(alertArea: string | null | undefined, profileLocation: string | null | undefined): boolean {
  if (!alertArea || alertArea.trim().toLowerCase() === 'all areas') return true;
  if (!profileLocation) return false;
  const a = alertArea.trim().toLowerCase();
  const p = profileLocation.trim().toLowerCase();
  return p.includes(a) || a.includes(p);
}

async function sendTwilioMessage(
  channel: 'sms' | 'whatsapp',
  to: string,
  body: string
): Promise<{ to: string; ok: boolean; error?: string }> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = channel === 'whatsapp'
    ? Deno.env.get('TWILIO_WHATSAPP_NUMBER')
    : Deno.env.get('TWILIO_PHONE_NUMBER');

  if (!accountSid || !authToken || !fromNumber) {
    return { to, ok: false, error: `Twilio ${channel} secrets not configured` };
  }

  const prefix = channel === 'whatsapp' ? 'whatsapp:' : '';
  const params = new URLSearchParams({
    To: `${prefix}${to}`,
    From: `${prefix}${fromNumber}`,
    Body: body,
  });
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    return { to, ok: false, error: errorBody };
  }
  return { to, ok: true };
}

// Sends an already-published alert to every subscriber matching both its
// role targets ("Send To" checkboxes) and its target area. Best-effort:
// callers already saved/updated the alert row before calling this, so
// messaging failures here must never surface as the overall request failing
// - only as lower counts in the returned summary.
async function dispatchAlertMessages(supabase: any, alert: any) {
  const emptyChannelResult = { sent: 0, failed: 0, total: 0 };
  let smsResults = { ...emptyChannelResult };
  let whatsappResults = { ...emptyChannelResult };

  try {
    const { data: subscribers, error: subError } = await supabase
      .from('alert_subscriptions')
      .select('phone, user_id, profiles(role, location)');

    if (subError) throw subError;

    const targets = alert.targets;
    const sendToAll = !targets || targets.all;
    const recipients = (subscribers || []).filter((s: any) => {
      const role = s.profiles?.role;
      const roleMatches = sendToAll ||
        (targets.volunteers && role === 'volunteer') ||
        (targets.admins && role === 'admin');
      return roleMatches && areaMatches(alert.area, s.profiles?.location);
    });

    const summarize = (results: PromiseSettledResult<{ ok: boolean; to: string; error?: string }>[]) => ({
      sent: results.filter((r) => r.status === 'fulfilled' && r.value.ok).length,
      failed: results.filter((r) => !(r.status === 'fulfilled' && r.value.ok)).length,
      total: recipients.length,
    });
    const logFailures = (channel: string, results: PromiseSettledResult<{ ok: boolean; to: string; error?: string }>[]) => {
      for (const r of results) {
        if (r.status === 'rejected') console.error(`${channel} send rejected:`, r.reason);
        else if (!r.value.ok) console.error(`${channel} send failed:`, r.value.to, r.value.error);
      }
    };

    const messageText = `EcoKubatana Alert [${alert.level}] ${alert.area || 'All Areas'}: ${alert.message}`;

    const smsSettled = await Promise.allSettled(
      recipients.map((r: any) => sendTwilioMessage('sms', normalizePhone(r.phone), messageText))
    );
    smsResults = summarize(smsSettled);
    logFailures('SMS', smsSettled);

    const whatsappSettled = await Promise.allSettled(
      recipients.map((r: any) => sendTwilioMessage('whatsapp', normalizePhone(r.phone), messageText))
    );
    whatsappResults = summarize(whatsappSettled);
    logFailures('WhatsApp', whatsappSettled);
  } catch (dispatchError) {
    console.error('Messaging dispatch error:', dispatchError);
  }

  return { smsResults, whatsappResults };
}

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

    // GET /alerts - List alerts. Default: published only (public feed).
    // ?status=pending - admin-only review queue.
    if (req.method === 'GET' && pathParts.length === 1) {
      const statusParam = url.searchParams.get('status');

      if (statusParam === 'pending') {
        if (userRole !== 'admin') {
          return new Response(
            JSON.stringify({ success: false, error: 'Admin access required' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('alerts')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /alerts/subscribe - Subscribe a phone number
    if (req.method === 'POST' && pathParts.length === 2 && pathParts[1] === 'subscribe') {
      const body = await req.json();
      const { phone } = body;

      if (!phone) {
        return new Response(
          JSON.stringify({ success: false, error: 'Phone number is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('alert_subscriptions')
        .insert({ user_id: userId, phone: normalizePhone(phone) })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /alerts - Propose a new alert (any authenticated user).
    // Stays invisible/unsent until an admin publishes it.
    if (req.method === 'POST' && pathParts.length === 1) {
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();
      const { type, level = 'Info', area, message, targets } = body;

      if (!type || !message) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('alerts')
        .insert({
          type,
          level,
          area: area || 'All Areas',
          message,
          targets,
          created_by: userId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT /alerts/:id/publish - Publish a pending alert (admin only), then send SMS/WhatsApp
    if (req.method === 'PUT' && pathParts.length === 3 && pathParts[2] === 'publish') {
      if (userRole !== 'admin') {
        return new Response(
          JSON.stringify({ success: false, error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const alertId = pathParts[1];

      const { data, error } = await supabase
        .from('alerts')
        .update({ status: 'published', published_at: new Date().toISOString(), reviewed_by: userId })
        .eq('id', alertId)
        .eq('status', 'pending')
        .select()
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ success: false, error: 'Alert not found or already reviewed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { smsResults, whatsappResults } = await dispatchAlertMessages(supabase, data);

      return new Response(
        JSON.stringify({ success: true, data, smsResults, whatsappResults }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT /alerts/:id/reject - Reject a pending alert (admin only), no messaging
    if (req.method === 'PUT' && pathParts.length === 3 && pathParts[2] === 'reject') {
      if (userRole !== 'admin') {
        return new Response(
          JSON.stringify({ success: false, error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const alertId = pathParts[1];

      const { data, error } = await supabase
        .from('alerts')
        .update({ status: 'rejected', reviewed_by: userId })
        .eq('id', alertId)
        .eq('status', 'pending')
        .select()
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ success: false, error: 'Alert not found or already reviewed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data }),
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
