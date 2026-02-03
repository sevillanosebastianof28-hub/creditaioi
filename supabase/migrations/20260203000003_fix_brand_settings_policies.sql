-- Fix brand_settings policies to ensure agency owners can save settings
-- This migration ensures proper permissions for insert and update operations

-- Drop existing policies
DROP POLICY IF EXISTS "Agency owners can view own brand settings" ON public.brand_settings;
DROP POLICY IF EXISTS "Agency members can view brand settings" ON public.brand_settings;
DROP POLICY IF EXISTS "Agency owners can insert own brand settings" ON public.brand_settings;
DROP POLICY IF EXISTS "Agency owners can update own brand settings" ON public.brand_settings;

-- Create new comprehensive policies

-- SELECT: All agency members can view their agency's brand settings
CREATE POLICY "Agency members can view brand settings"
ON public.brand_settings
FOR SELECT
USING (
    agency_id IN (
        SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
);

-- INSERT: Agency owners can create brand settings for their agency
CREATE POLICY "Agency owners can insert brand settings"
ON public.brand_settings
FOR INSERT
WITH CHECK (
    agency_id IN (
        SELECT a.id 
        FROM public.agencies a
        JOIN public.profiles p ON p.id = auth.uid()
        WHERE a.owner_id = auth.uid() 
           OR (a.id = p.agency_id AND p.role = 'agency_owner')
    )
);

-- UPDATE: Agency owners can update their agency's brand settings
CREATE POLICY "Agency owners can update brand settings"
ON public.brand_settings
FOR UPDATE
USING (
    agency_id IN (
        SELECT a.id 
        FROM public.agencies a
        JOIN public.profiles p ON p.id = auth.uid()
        WHERE a.owner_id = auth.uid() 
           OR (a.id = p.agency_id AND p.role = 'agency_owner')
    )
)
WITH CHECK (
    agency_id IN (
        SELECT a.id 
        FROM public.agencies a
        JOIN public.profiles p ON p.id = auth.uid()
        WHERE a.owner_id = auth.uid() 
           OR (a.id = p.agency_id AND p.role = 'agency_owner')
    )
);

-- Add comments
COMMENT ON POLICY "Agency members can view brand settings" ON public.brand_settings 
IS 'Allows all agency members to view and receive real-time updates';

COMMENT ON POLICY "Agency owners can insert brand settings" ON public.brand_settings 
IS 'Allows agency owners to create brand settings for their agency';

COMMENT ON POLICY "Agency owners can update brand settings" ON public.brand_settings 
IS 'Allows agency owners to update their agency brand settings';
