-- Add subdomain field for multi-tenant white-labeling
ALTER TABLE public.brand_settings 
ADD COLUMN IF NOT EXISTS subdomain TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Create index for fast subdomain lookups
CREATE INDEX IF NOT EXISTS idx_brand_settings_subdomain ON public.brand_settings(subdomain) WHERE subdomain IS NOT NULL;

-- Create a function to get brand settings by subdomain (for public access)
CREATE OR REPLACE FUNCTION public.get_brand_settings_by_subdomain(p_subdomain TEXT)
RETURNS TABLE (
  id UUID,
  company_name TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  support_email TEXT,
  support_phone TEXT,
  footer_text TEXT,
  login_background_url TEXT,
  login_tagline TEXT,
  terms_url TEXT,
  privacy_url TEXT,
  hide_powered_by BOOLEAN,
  welcome_message TEXT,
  button_style TEXT,
  enabled_features JSONB,
  client_portal_config JSONB
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    bs.id,
    bs.company_name,
    bs.logo_url,
    bs.favicon_url,
    bs.primary_color,
    bs.secondary_color,
    bs.accent_color,
    bs.support_email,
    bs.support_phone,
    bs.footer_text,
    bs.login_background_url,
    bs.login_tagline,
    bs.terms_url,
    bs.privacy_url,
    bs.hide_powered_by,
    bs.welcome_message,
    bs.button_style,
    bs.enabled_features,
    bs.client_portal_config
  FROM brand_settings bs
  WHERE bs.subdomain = p_subdomain
    AND bs.is_published = true
  LIMIT 1;
$$;