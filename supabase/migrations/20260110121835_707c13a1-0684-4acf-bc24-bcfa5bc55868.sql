-- Add additional white label configuration columns
ALTER TABLE public.brand_settings 
ADD COLUMN IF NOT EXISTS login_background_url text,
ADD COLUMN IF NOT EXISTS login_tagline text,
ADD COLUMN IF NOT EXISTS email_header_logo_url text,
ADD COLUMN IF NOT EXISTS email_footer_text text,
ADD COLUMN IF NOT EXISTS terms_url text,
ADD COLUMN IF NOT EXISTS privacy_url text,
ADD COLUMN IF NOT EXISTS hide_powered_by boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_css text,
ADD COLUMN IF NOT EXISTS welcome_message text,
ADD COLUMN IF NOT EXISTS sidebar_style text DEFAULT 'default',
ADD COLUMN IF NOT EXISTS button_style text DEFAULT 'rounded';

-- Add comment for documentation
COMMENT ON COLUMN public.brand_settings.login_background_url IS 'Custom background image for login page';
COMMENT ON COLUMN public.brand_settings.login_tagline IS 'Tagline shown on login page';
COMMENT ON COLUMN public.brand_settings.email_header_logo_url IS 'Logo used in email templates';
COMMENT ON COLUMN public.brand_settings.email_footer_text IS 'Footer text for email templates';
COMMENT ON COLUMN public.brand_settings.terms_url IS 'URL to Terms of Service page';
COMMENT ON COLUMN public.brand_settings.privacy_url IS 'URL to Privacy Policy page';
COMMENT ON COLUMN public.brand_settings.hide_powered_by IS 'Hide powered by Credit AI badge';
COMMENT ON COLUMN public.brand_settings.custom_css IS 'Custom CSS overrides';
COMMENT ON COLUMN public.brand_settings.welcome_message IS 'Welcome message shown to clients on first login';
COMMENT ON COLUMN public.brand_settings.sidebar_style IS 'Style variant for sidebar (default, minimal, expanded)';
COMMENT ON COLUMN public.brand_settings.button_style IS 'Button style variant (rounded, square, pill)';