// ============================================
// TRANSLATE EDGE FUNCTION (OpenAI)
// ============================================
// Deploy this to Supabase Edge Functions
// Name: translate
//
// POST /translate - Translate a piece of stored content (FAQ answer,
// incident description, alert message, etc.) into the requested language,
// with a cache so the same (source_type, source_id, language) is only ever
// translated once.
//
// Requires authentication (any logged-in user).
//
// Body: { source_type, source_id, text, language }
//   source_type: free-form label, e.g. 'faq_question', 'faq_answer'
//   source_id:   the id of the row the text belongs to
//   text:        the current original (English) text
//   language:    target language code, e.g. 'sn', 'nd', 'fr'
//
// Requires this secret set on the function (Dashboard -> Edge Functions -> Manage secrets):
//   OPENAI_API_KEY  (shared with the ai-assistant / incident-analysis functions)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const LANGUAGE_NAMES = {
  en: 'English',
  sn: 'Shona',
  nd: 'Ndebele',
  sw: 'Swahili',
  fr: 'French',
  pt: 'Portuguese',
};

function jsonResponse(body, status = 200) {
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

    if (req.method !== 'POST') {
      return jsonResponse({ success: false, error: 'Route not found' }, 404);
    }

    const { source_type, source_id, text, language } = await req.json();
    if (!source_type || !source_id || !text || !language) {
      return jsonResponse({ success: false, error: 'source_type, source_id, text, and language are all required' }, 400);
    }

    if (language === 'en') {
      return jsonResponse({ success: true, translated_text: text, cached: false });
    }

    // Check the cache first - if the original text hasn't changed since it
    // was cached, reuse the existing translation instead of paying for a
    // new OpenAI call.
    const { data: cached } = await supabase
      .from('translations')
      .select('original_text, translated_text')
      .eq('source_type', source_type)
      .eq('source_id', source_id)
      .eq('language', language)
      .maybeSingle();

    if (cached && cached.original_text === text) {
      return jsonResponse({ success: true, translated_text: cached.translated_text, cached: true });
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return jsonResponse({ success: false, error: 'Translation is not configured yet' }, 503);
    }

    const languageName = LANGUAGE_NAMES[language] || language;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Translate the user's text into ${languageName}. Respond with ONLY the translation - no notes, no quotes, no explanation. Preserve the tone and meaning as closely as possible.`,
          },
          { role: 'user', content: text },
        ],
        max_tokens: 1024,
      }),
    });

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text();
      console.error('OpenAI translate error:', openaiResponse.status, errorBody);
      return jsonResponse({ success: false, error: 'Could not translate this right now' }, 502);
    }

    const data = await openaiResponse.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim();
    if (!translatedText) {
      return jsonResponse({ success: false, error: 'Could not translate this right now' }, 502);
    }

    const { error: upsertError } = await supabase
      .from('translations')
      .upsert(
        { source_type, source_id, language, original_text: text, translated_text: translatedText },
        { onConflict: 'source_type,source_id,language' }
      );

    if (upsertError) {
      console.error('Failed to cache translation:', upsertError);
      // Not fatal - still return the translation even if caching failed.
    }

    return jsonResponse({ success: true, translated_text: translatedText, cached: false });

  } catch (error) {
    console.error('Translate error:', error);
    return jsonResponse({ success: false, error: 'Could not translate this right now' }, 500);
  }
});
