-- Create storage bucket for brand assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow agency owners to upload their brand assets
CREATE POLICY "Agency owners can upload brand assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'brand-assets' 
  AND auth.uid() IS NOT NULL
  AND has_role(auth.uid(), 'agency_owner'::app_role)
);

-- Allow public read access to brand assets (needed for clients to see logos)
CREATE POLICY "Public can view brand assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'brand-assets');

-- Allow agency owners to update their brand assets
CREATE POLICY "Agency owners can update brand assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'brand-assets' 
  AND auth.uid() IS NOT NULL
  AND has_role(auth.uid(), 'agency_owner'::app_role)
);

-- Allow agency owners to delete their brand assets
CREATE POLICY "Agency owners can delete brand assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'brand-assets' 
  AND auth.uid() IS NOT NULL
  AND has_role(auth.uid(), 'agency_owner'::app_role)
);