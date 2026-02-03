-- Auto-apply migration for brand_settings policies
-- This will run when deployed to Supabase

BEGIN;

-- Drop all existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Agency owners can view own brand settings" ON public.brand_settings;
    DROP POLICY IF EXISTS "Agency members can view brand settings" ON public.brand_settings;
    DROP POLICY IF EXISTS "Agency owners can insert own brand settings" ON public.brand_settings;
    DROP POLICY IF EXISTS "Agency owners can update own brand settings" ON public.brand_settings;
    DROP POLICY IF EXISTS "Agency owners can insert brand settings" ON public.brand_settings;
    DROP POLICY IF EXISTS "Agency owners can update brand settings" ON public.brand_settings;
    DROP POLICY IF EXISTS "brand_settings_select_policy" ON public.brand_settings;
    DROP POLICY IF EXISTS "brand_settings_insert_policy" ON public.brand_settings;
    DROP POLICY IF EXISTS "brand_settings_update_policy" ON public.brand_settings;
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if policies don't exist
    NULL;
END $$;

-- Create SELECT policy: All agency members can view
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

-- Create INSERT policy: Agency owners can create
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

-- Create UPDATE policy: Agency owners can update
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

COMMIT;

-- Verify policies exist
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'brand_settings';
    
    RAISE NOTICE 'Brand settings policies created: %', policy_count;
END $$;
