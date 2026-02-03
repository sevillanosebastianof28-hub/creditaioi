-- Enable realtime for brand_settings table
ALTER PUBLICATION supabase_realtime ADD TABLE public.brand_settings;

-- Set REPLICA IDENTITY to FULL for complete column data in real-time updates
ALTER TABLE public.brand_settings REPLICA IDENTITY FULL;