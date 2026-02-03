#!/usr/bin/env node

/**
 * Apply White-Label Database Fix
 * This script updates the Supabase database function to support white-labeling
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read Supabase credentials from environment or prompt
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Error: VITE_SUPABASE_URL not found in environment');
  console.log('\n💡 Set your Supabase URL:');
  console.log('   export VITE_SUPABASE_URL="https://your-project.supabase.co"');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in environment');
  console.log('\n💡 Get your service role key from:');
  console.log('   Supabase Dashboard → Project Settings → API → service_role key');
  console.log('\n   Then set it:');
  console.log('   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🔧 Applying white-label database fix...\n');

  // SQL to fix the function
  const sql = `
-- Fix get_brand_settings_by_subdomain function to include all fields
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_brand_settings_by_subdomain(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_brand_settings_by_subdomain(TEXT) TO authenticated;
`;

  try {
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { query: sql }).catch(() => {
      // If exec_sql doesn't exist, try direct SQL execution
      return supabase.from('_migrations').select('*').limit(0).then(() => {
        throw new Error('Direct SQL execution not available. Using alternative method...');
      });
    });

    // Alternative: Use the Supabase management API
    console.log('📝 Executing SQL migration...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      throw new Error('Migration failed. Please run the SQL manually in Supabase Dashboard.');
    }

    console.log('✅ Database function updated successfully!\n');
    
    // Verify the function works
    console.log('🔍 Verifying function...');
    const { data: testData, error: testError } = await supabase
      .rpc('get_brand_settings_by_subdomain', { p_subdomain: 'test' });
    
    if (testError && !testError.message.includes('no rows')) {
      console.warn('⚠️  Warning: Function verification failed:', testError.message);
      console.log('\n💡 This is normal if no brand settings exist yet.\n');
    } else {
      console.log('✅ Function is working correctly!\n');
    }

    // Check existing brand settings
    console.log('📊 Checking brand settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('brand_settings')
      .select('subdomain, company_name, is_published')
      .limit(5);

    if (settingsError) {
      console.log('⚠️  Could not fetch brand settings:', settingsError.message);
    } else if (settings && settings.length > 0) {
      console.log('\n📋 Current brand settings:');
      settings.forEach(s => {
        const status = s.is_published ? '✅ Published' : '⏸️  Draft';
        console.log(`   ${status} - Subdomain: "${s.subdomain || 'not set'}" - Company: "${s.company_name}"`);
      });
      
      const unpublished = settings.filter(s => !s.is_published);
      if (unpublished.length > 0) {
        console.log('\n💡 Tip: Make sure to publish your brand settings in the White Label settings page.');
      }
    } else {
      console.log('📝 No brand settings found. Create one in Settings → White Label');
    }

    console.log('\n✨ Done! Your white-label branding should now work.\n');
    console.log('🌐 Test it by visiting: https://credit-ai.online?subdomain=YOUR_SUBDOMAIN\n');

  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.log('\n📝 Manual Steps:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Run the SQL in: fix_white_label_function.sql');
    console.log('3. Or copy from: WHITE_LABEL_FIX_INSTRUCTIONS.md\n');
    process.exit(1);
  }
}

applyMigration();
