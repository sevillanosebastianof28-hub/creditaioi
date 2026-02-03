-- Enable realtime for brand_settings table
ALTER PUBLICATION supabase_realtime ADD TABLE public.brand_settings;

-- Set replica identity to full so all columns are sent in realtime updates
ALTER TABLE public.brand_settings REPLICA IDENTITY FULL;

-- Add comment
COMMENT ON TABLE public.brand_settings IS 'Brand/white-label settings with realtime updates enabled';
