-- Create white-label/branding settings table
CREATE TABLE public.brand_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL DEFAULT 'Credit AI',
    logo_url TEXT,
    favicon_url TEXT,
    primary_color TEXT DEFAULT '142 76% 36%',
    secondary_color TEXT DEFAULT '215 28% 17%',
    accent_color TEXT DEFAULT '142 71% 45%',
    custom_domain TEXT,
    support_email TEXT,
    support_phone TEXT,
    footer_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(agency_id)
);

-- Enable RLS
ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Agency owners can view their own brand settings
CREATE POLICY "Agency owners can view own brand settings"
ON public.brand_settings
FOR SELECT
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
    )
);

-- Policy: Agency owners can insert their own brand settings
CREATE POLICY "Agency owners can insert own brand settings"
ON public.brand_settings
FOR INSERT
WITH CHECK (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
    )
);

-- Policy: Agency owners can update their own brand settings
CREATE POLICY "Agency owners can update own brand settings"
ON public.brand_settings
FOR UPDATE
USING (
    agency_id IN (
        SELECT id FROM public.agencies WHERE owner_id = auth.uid()
    )
);

-- Trigger for updated_at
CREATE TRIGGER update_brand_settings_updated_at
BEFORE UPDATE ON public.brand_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();