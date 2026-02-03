-- Add policy for staff and clients to view brand settings of their agency
-- This enables real-time brand updates for all users in the agency

CREATE POLICY "Agency members can view brand settings"
ON public.brand_settings
FOR SELECT
USING (
    agency_id IN (
        -- Get agency from user's profile
        SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
);

-- Drop the old more restrictive policy if it exists
DROP POLICY IF EXISTS "Agency owners can view own brand settings" ON public.brand_settings;

COMMENT ON POLICY "Agency members can view brand settings" ON public.brand_settings IS 'Allows all agency members (owners, staff, clients) to view and receive real-time updates for their agency brand settings';
