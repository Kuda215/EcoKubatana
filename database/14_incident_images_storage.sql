-- ============================================
-- INCIDENT IMAGES - STORAGE BUCKET
-- ============================================
-- Run this in Supabase SQL Editor
-- Backs the image upload on the Report Incident form, whose public URL is
-- both stored on the incident row (image_url) and sent to the
-- incident-analysis edge function for real AI vision analysis.

INSERT INTO storage.buckets (id, name, public)
VALUES ('incident-images', 'incident-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload incident images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'incident-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view incident images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'incident-images');
