-- Emergency fix for brand_settings permissions
-- Run this in Supabase SQL Editor if publishing still fails

-- Drop all existing policies on brand_settings
DROP POLICY IF EXISTS "Agency owners can view own brand settings" ON public.brand_settings;
DROP POLICY IF EXISTS "Agency members can view brand settings" ON public.brand_settings;
DROP POLICY IF EXISTS "Agency owners can insert own brand settings" ON public.brand_settings;
DROP POLICY IF EXISTS "Agency owners can update own brand settings" ON public.brand_settings;
DROP POLICY IF EXISTS "Agency owners can insert brand settings" ON public.brand_settings;
DROP POLICY IF EXISTS "Agency owners can update brand settings" ON public.brand_settings;

-- Recreate policies with correct permissions

-- 1. SELECT: All agency members can view
CREATE POLICY "brand_settings_select_policy"
ON public.brand_settings
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.agency_id = brand_settings.agency_id
    )
);

-- 2. INSERT: Agency owners can create
CREATE POLICY "brand_settings_insert_policy"
ON public.brand_settings
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.agency_id = brand_settings.agency_id
        AND profiles.role = 'agency_owner'
    )
);

-- 3. UPDATE: Agency owners can update
CREATE POLICY "brand_settings_update_policy"
ON public.brand_settings
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.agency_id = brand_settings.agency_id
        AND profiles.role = 'agency_owner'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.agency_id = brand_settings.agency_id
        AND profiles.role = 'agency_owner'
    )
);
