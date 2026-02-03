-- ============================================
-- FIX WHITE-LABEL FUNCTION AND PERMISSIONS
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Update the function to include all brand_settings fields
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
  sidebar_style TEXT,
  custom_css TEXT,
  enabled_features JSONB,
  client_portal_config JSONB,
  agency_id UUID
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
    bs.sidebar_style,
    bs.custom_css,
    bs.enabled_features,
    bs.client_portal_config,
    bs.agency_id
  FROM brand_settings bs
  WHERE bs.subdomain = p_subdomain
    AND bs.is_published = true
  LIMIT 1;
$$;

-- Step 2: Grant execute permissions to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.get_brand_settings_by_subdomain(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_brand_settings_by_subdomain(TEXT) TO authenticated;

-- Step 3: Verify the function works
-- SELECT * FROM get_brand_settings_by_subdomain('sevillano');

-- Step 4: Check if your brand_settings has data
-- SELECT subdomain, company_name, is_published FROM brand_settings;

COMMENT ON FUNCTION public.get_brand_settings_by_subdomain(TEXT) 
IS 'Public function to get published brand settings by subdomain for white-label portals';
