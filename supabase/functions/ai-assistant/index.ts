// ============================================
// AI ASSISTANT EDGE FUNCTION (OpenAI)
// ============================================
// Deploy this to Supabase Edge Functions
// Name: ai-assistant
//
// POST /ai-assistant - Chat with the OpenAI-powered climate assistant.
// Requires authentication (any logged-in user). Client sends the full
// message history each call so the conversation stays coherent across
// turns purely as client-side state - nothing is persisted server-side.
//
// Requires this secret set on the function (Dashboard -> Edge Functions -> Manage secrets):
//   OPENAI_API_KEY  (from platform.openai.com - separate from any ChatGPT login,
//   and requires billing set up there - the free ChatGPT tier does not include API access)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `You are the EcoKubatana AI Assistant, built into a community climate resilience platform used by communities in Zimbabwe and Southern Africa.

Help with practical climate adaptation and mitigation questions: water conservation, drought-resistant farming, renewable energy, disaster preparedness, and similar local, actionable topics. Keep answers concise and practical rather than academic.

You are not an emergency service. If someone describes an active emergency or safety threat, tell them to use the app's "Report Incident" feature or check "Alerts" for official guidance rather than relying solely on your answer.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Route not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI assistant is not configured yet' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 1024,
      }),
    });

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text();
      console.error('OpenAI error:', openaiResponse.status, errorBody);
      return new Response(
        JSON.stringify({ success: false, error: 'Could not reach the AI assistant right now' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await openaiResponse.json();
    const reply = data.choices?.[0]?.message?.content
      || "Sorry, I couldn't come up with an answer to that - try asking again.";

    return new Response(
      JSON.stringify({ success: true, reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI assistant error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Could not reach the AI assistant right now' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
