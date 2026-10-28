---
name: ai-climate-features
description: >-
  Implement EcoKubatana AI features: OpenAI chat assistant, voice report
  (Whisper + TTS), incident photo vision analysis, and on-demand translation
  cache. Use when prompts mention AI assistant, voice-first report, photo
  assessment, or translating stored content.
paths:
  - "supabase/functions/ai-assistant/**/*"
  - "supabase/functions/incident-analysis/**/*"
  - "supabase/functions/translate/**/*"
  - "src/components/VoiceReport.jsx"
  - "src/components/ReportIncident.jsx"
  - "src/components/KnowledgeHub.jsx"
  - "public/sounds/**/*"
---

# AI Climate Features

## Prompt patterns

- “AI assistant / chatbot for climate help”
- “Voice report / speak / transcribe”
- “Analyze uploaded photo / suggest incident type”
- “Translate FAQs / content with cache”

## Existing surfaces

| Capability | Backend | Frontend |
|------------|---------|----------|
| Chat | `ai-assistant` POST chat | KnowledgeHub / assistant UI |
| Transcribe | `ai-assistant/transcribe` (Whisper) | `VoiceReport.jsx` |
| Speak | `ai-assistant/speak` (TTS) | `VoiceReport.jsx` |
| Vision | `incident-analysis` | `ReportIncident.jsx` + Storage `incident-images` |
| Translate | `translate` + `translations` table | FAQ list via i18n layer |

## How to execute

1. Keep the EcoKubatana system prompt practical for Zimbabwe / Southern Africa; short sentences (TTS-friendly); never claim to be emergency services — redirect to Report Incident / Alerts.
2. Require logged-in auth on AI routes (match existing bearer checks).
3. Secrets live on the function (`OPENAI_API_KEY`), never in Vite env for server keys.
4. **Honesty rule from prior chats:** do not fabricate calibrated confidence percentages for single-image LLM judgments.
5. Vision results should drive real actions already in product (autofill type/severity; propose pending alert for admin) — not decorative text only.
6. Translation: cache per content identity + language; fall back to English while loading/on failure.
7. Reuse `src/lib/api.js` helpers; extend rather than parallel fetch clients.
8. Storage buckets: follow `database/14_incident_images_storage.sql` patterns.

## Verify

- Chat multi-turn with history from client state
- Voice: record → transcript → reply → audio
- Photo: upload → assessment → form fields / alert propose
- Missing `OPENAI_API_KEY` returns a clear error, not a crash loop

## Done when

Feature is auth-gated, wired to real product actions, and prototype-scope limits are stated.
