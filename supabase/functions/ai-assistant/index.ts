// ============================================
// AI ASSISTANT EDGE FUNCTION (OpenAI)
// ============================================
// Deploy this to Supabase Edge Functions
// Name: ai-assistant
//
// POST /ai-assistant            - Chat with the OpenAI-powered climate assistant.
// POST /ai-assistant/transcribe - Speech-to-text via OpenAI Whisper (voice report input)
// POST /ai-assistant/speak      - Text-to-speech via OpenAI TTS (voice report output)
//
// Requires authentication (any logged-in user) on every route. Chat sends
// the full message history each call so the conversation stays coherent
// across turns purely as client-side state - nothing is persisted server-side.
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

Help with practical climate adaptation and mitigation questions: water conservation, drought-resistant farming, renewable energy, disaster preparedness, and similar local, actionable topics. Keep answers concise and practical rather than academic - this may be read aloud via text-to-speech, so prefer short sentences over bullet lists.

You are not an emergency service. If someone describes an active emergency or safety threat, tell them to use the app's "Report Incident" feature or check "Alerts" for official guidance rather than relying solely on your answer.`;

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

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
      return jsonResponse({ success: false, error: 'Authentication required' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return jsonResponse({ success: false, error: 'Authentication required' }, 401);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return jsonResponse({ success: false, error: 'AI assistant is not configured yet' }, 503);
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    // POST /ai-assistant/transcribe - speech-to-text via Whisper
    if (req.method === 'POST' && pathParts.length === 2 && pathParts[1] === 'transcribe') {
      const { audio_base64, mime_type } = await req.json();
      if (!audio_base64) {
        return jsonResponse({ success: false, error: 'audio_base64 is required' }, 400);
      }

      const audioBytes = base64ToUint8Array(audio_base64);
      const extension = (mime_type || 'audio/webm').includes('mp4') ? 'mp4' : 'webm';
      const form = new FormData();
      form.append('file', new Blob([audioBytes], { type: mime_type || 'audio/webm' }), `recording.${extension}`);
      form.append('model', 'whisper-1');

      const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${openaiApiKey}` },
        body: form,
      });

      if (!whisperResponse.ok) {
        const errorBody = await whisperResponse.text();
        console.error('Whisper error:', whisperResponse.status, errorBody);
        return jsonResponse({ success: false, error: 'Could not transcribe that recording' }, 502);
      }

      const { text } = await whisperResponse.json();
      return jsonResponse({ success: true, transcript: text || '' });
    }

    // POST /ai-assistant/speak - text-to-speech via OpenAI TTS
    if (req.method === 'POST' && pathParts.length === 2 && pathParts[1] === 'speak') {
      const { text, voice } = await req.json();
      if (!text || !text.trim()) {
        return jsonResponse({ success: false, error: 'text is required' }, 400);
      }

      const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: voice || 'alloy',
          input: text.slice(0, 4000),
        }),
      });

      if (!ttsResponse.ok) {
        const errorBody = await ttsResponse.text();
        console.error('TTS error:', ttsResponse.status, errorBody);
        return jsonResponse({ success: false, error: 'Could not generate speech right now' }, 502);
      }

      const audioBuffer = new Uint8Array(await ttsResponse.arrayBuffer());
      return jsonResponse({ success: true, audio_base64: uint8ArrayToBase64(audioBuffer), mime_type: 'audio/mpeg' });
    }

    // POST /ai-assistant - chat
    if (req.method === 'POST' && pathParts.length === 1) {
      const body = await req.json();
      const { messages } = body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return jsonResponse({ success: false, error: 'messages array is required' }, 400);
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
        return jsonResponse({ success: false, error: 'Could not reach the AI assistant right now' }, 502);
      }

      const data = await openaiResponse.json();
      const reply = data.choices?.[0]?.message?.content
        || "Sorry, I couldn't come up with an answer to that - try asking again.";

      return jsonResponse({ success: true, reply });
    }

    return jsonResponse({ success: false, error: 'Route not found' }, 404);

  } catch (error) {
    console.error('AI assistant error:', error);
    return jsonResponse({ success: false, error: 'Could not reach the AI assistant right now' }, 500);
  }
});
