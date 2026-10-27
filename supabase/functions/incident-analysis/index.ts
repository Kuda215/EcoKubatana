// ============================================
// INCIDENT ANALYSIS EDGE FUNCTION (OpenAI vision)
// ============================================
// Deploy this to Supabase Edge Functions
// Name: incident-analysis
//
// POST /incident-analysis - Real OpenAI vision analysis of an uploaded
// incident photo (Report Incident form). Requires authentication.
//
// Deliberately does NOT ask the model for a fabricated statistical
// "confidence: 92%" figure - an LLM looking at one photo has no calibrated
// probability to report, so that would just be theater. Instead it returns
// a plain-language assessment plus a likely type/severity the form can use
// to prefill fields and to propose a real alert.
//
// Requires this secret set on the function (Dashboard -> Edge Functions -> Manage secrets):
//   OPENAI_API_KEY  (shared with the ai-assistant function)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const VALID_TYPES = ['Flood', 'Drought', 'Heatwave', 'Strong Winds', 'Landslide', 'Wildfire', 'Pollution', 'Other'];
const VALID_SEVERITIES = ['low', 'medium', 'high'];

const SYSTEM_PROMPT = `You are vision analysis for EcoKubatana. You only assess climate and environment incident photos from Zimbabwe and Southern Africa.

A photo is climate-related ONLY if it clearly shows flood water, drought/failed crops, heat stress on land or people in extreme heat, wind damage from a storm, landslide or eroded slope, wildfire/smoke on land, or environmental pollution (dirty water, toxic dump, smoke from burning waste). People selfies, food, indoor rooms, documents, animals with no climate context, screenshots, and unrelated objects are NOT climate-related.

Respond ONLY with JSON:
{
  "climate_related": true or false,
  "likely_type": one of "Flood", "Drought", "Heatwave", "Strong Winds", "Landslide", "Wildfire", "Pollution", "Other",
  "assessment": max 2 plain sentences. If climate_related is false, say the photo is not a climate incident and do not guess a hazard.
  "suggested_severity": one of "low", "medium", "high"
}

If climate_related is false, set likely_type to "Other" and suggested_severity to "low". Never invent a statistic.`;

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

    const { image_url } = await req.json();
    if (!image_url) {
      return jsonResponse({ success: false, error: 'image_url is required' }, 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return jsonResponse({ success: false, error: 'Image analysis is not configured yet' }, 503);
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Is this a climate or environment incident photo? If not, climate_related must be false.' },
              { type: 'image_url', image_url: { url: image_url } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 300,
      }),
    });

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text();
      console.error('OpenAI vision error:', openaiResponse.status, errorBody);
      return jsonResponse({ success: false, error: 'Could not analyze this image right now' }, 502);
    }

    const data = await openaiResponse.json();
    let parsed;
    try {
      parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    } catch {
      parsed = {};
    }

    const climateRelated = parsed.climate_related === true;
    const likelyType = climateRelated && VALID_TYPES.includes(parsed.likely_type) ? parsed.likely_type : 'Other';
    const suggestedSeverity = climateRelated && VALID_SEVERITIES.includes(parsed.suggested_severity)
      ? parsed.suggested_severity
      : 'low';
    const assessment = typeof parsed.assessment === 'string' && parsed.assessment.trim()
      ? parsed.assessment.trim()
      : (climateRelated
        ? "Couldn't confidently identify what this photo shows."
        : 'This photo is not a climate or environment incident. Upload flood, drought, heat, storm, fire, landslide, or pollution.');

    return jsonResponse({
      success: true,
      data: { climateRelated, likelyType, assessment, suggestedSeverity },
    });

  } catch (error) {
    console.error('Incident analysis error:', error);
    return jsonResponse({ success: false, error: 'Could not analyze this image right now' }, 500);
  }
});
