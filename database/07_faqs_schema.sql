-- ============================================
-- FAQS - DATABASE-BACKED, ADMIN-EDITABLE
-- ============================================
-- Run this in Supabase SQL Editor
-- Replaces the hardcoded FAQ list in KnowledgeHub.jsx with a real table.
-- No edge function needed for this one - plain CRUD, fully expressed by RLS.

CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_display_order ON faqs(display_order);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Anyone logged in can read the FAQ list
CREATE POLICY "Anyone authenticated can read FAQs"
  ON faqs FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can add, edit, or delete FAQs
CREATE POLICY "Admins can manage FAQs"
  ON faqs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Keep updated_at current on edits
CREATE OR REPLACE FUNCTION update_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS faqs_updated_at ON faqs;
CREATE TRIGGER faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_faqs_updated_at();

-- Seed with the FAQs already shown in the UI, so the migration is a no-op
-- visually. No unique constraint on question text, so only run this insert
-- once - re-running the whole file would duplicate these rows.
INSERT INTO faqs (question, answer, display_order) VALUES
  ('What is climate change?', 'Climate change refers to long-term shifts in temperatures and weather patterns, primarily caused by human activities.', 1),
  ('How can I reduce my water usage?', 'Fix leaks, use water-efficient fixtures, harvest rainwater, and be mindful of daily consumption.', 2),
  ('What crops grow well in drought conditions?', 'Drought-resistant crops include sorghum, millet, cassava, and certain varieties of beans.', 3),
  ('How do I report a climate incident?', 'Use the "Report Incident" feature in the navigation menu to submit detailed information.', 4),
  ('Can I get AI help for climate questions?', 'Yes! Our AI assistant can answer your questions about climate adaptation, mitigation, and local solutions.', 5);

COMMENT ON TABLE faqs IS 'Admin-editable FAQ list shown in KnowledgeHub';
