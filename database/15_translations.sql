-- ============================================
-- TRANSLATIONS - STORED CONTENT TRANSLATION CACHE
-- ============================================
-- Run this in Supabase SQL Editor
-- Backs on-demand translation of stored (database) content - FAQ answers,
-- incident descriptions, alert messages, etc. - as opposed to the UI chrome,
-- which is handled entirely client-side via react-i18next.
--
-- This is a generic cache, not per-table columns: translating a piece of
-- content is a real OpenAI API call (cost + latency), so every translation
-- is cached here keyed by (source_type, source_id, language) and reused on
-- every later view instead of re-translating the same text repeatedly.
-- source_type is a free-form label like 'faq_question', 'faq_answer',
-- 'incident_description' - whatever the calling code chooses to identify
-- the field being translated; source_id is that row's id.

CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  language TEXT NOT NULL,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_type, source_id, language)
);

CREATE INDEX IF NOT EXISTS idx_translations_lookup ON translations(source_type, source_id, language);

ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Translations mirror already-public/authenticated-readable content - not
-- sensitive on their own. Any authenticated user can read the cache; only
-- the translate edge function (service role) writes to it.
CREATE POLICY "Authenticated users can read translations"
  ON translations FOR SELECT
  USING (auth.uid() IS NOT NULL);

COMMENT ON TABLE translations IS 'Cache of on-demand OpenAI translations for stored content, keyed by (source_type, source_id, language)';
