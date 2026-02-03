#!/usr/bin/env node

/**
 * Emergency fix script to update brand_settings RLS policies
 * Run with: node scripts/fix-brand-policies.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const policiesSql = `
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
`;

async function applyFix() {
  console.log('🔧 Applying brand_settings policy fix...\n');
  
  try {
    // Note: The Supabase JS client doesn't support running DDL directly
    // We need to use the Supabase Management API or run this via SQL editor
    console.log('⚠️  Cannot run DDL via Supabase JS client.\n');
    console.log('📋 Please run the following SQL in your Supabase SQL Editor:\n');
    console.log('🔗 https://supabase.com/dashboard/project/ctzckttucdjlysiohlwh/sql/new\n');
    console.log('─'.repeat(80));
    console.log(policiesSql);
    console.log('─'.repeat(80));
    console.log('\n✅ Copy the SQL above and run it in the Supabase dashboard.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyFix();
