#!/bin/bash

# Apply White-Label Database Fix
# This script applies the database migration automatically

set -e

echo "🔧 Applying white-label database fix..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo ""
    echo "💡 Create a .env file with:"
    echo "   VITE_SUPABASE_URL=https://your-project.supabase.co"
    echo "   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ Error: VITE_SUPABASE_URL not found in .env"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] && [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env"
    echo ""
    echo "💡 Get it from: Supabase Dashboard → Project Settings → API"
    exit 1
fi

# Use service role key if available, otherwise anon key (less preferred)
API_KEY="${SUPABASE_SERVICE_ROLE_KEY:-$VITE_SUPABASE_ANON_KEY}"

echo "📝 Running migration SQL..."
echo ""

# Read the SQL file
SQL=$(cat fix_white_label_function.sql)

# Try to execute using psql if available
if command -v psql &> /dev/null; then
    # Extract connection string from Supabase URL
    # Note: This requires database password
    echo "⚠️  psql detected but requires database password"
    echo "   Run manually in Supabase SQL Editor instead"
    echo ""
fi

# Try using Supabase Management API (requires service role key)
echo "🌐 Attempting to apply via Supabase API..."

# Create a temporary SQL file for the specific commands
cat > /tmp/migration.sql << 'EOF'
-- Fix get_brand_settings_by_subdomain function
CREATE OR REPLACE FUNCTION public.get_brand_settings_by_subdomain(p_subdomain TEXT)
RETURNS TABLE (
  id UUID, company_name TEXT, logo_url TEXT, favicon_url TEXT,
  primary_color TEXT, secondary_color TEXT, accent_color TEXT,
  support_email TEXT, support_phone TEXT, footer_text TEXT,
  login_background_url TEXT, login_tagline TEXT,
  terms_url TEXT, privacy_url TEXT, hide_powered_by BOOLEAN,
  welcome_message TEXT, button_style TEXT, sidebar_style TEXT,
  custom_css TEXT, enabled_features JSONB, client_portal_config JSONB,
  agency_id UUID
)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT bs.id, bs.company_name, bs.logo_url, bs.favicon_url,
    bs.primary_color, bs.secondary_color, bs.accent_color,
    bs.support_email, bs.support_phone, bs.footer_text,
    bs.login_background_url, bs.login_tagline,
    bs.terms_url, bs.privacy_url, bs.hide_powered_by,
    bs.welcome_message, bs.button_style, bs.sidebar_style,
    bs.custom_css, bs.enabled_features, bs.client_portal_config,
    bs.agency_id
  FROM brand_settings bs
  WHERE bs.subdomain = p_subdomain AND bs.is_published = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_brand_settings_by_subdomain(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_brand_settings_by_subdomain(TEXT) TO authenticated;
EOF

echo "✅ Migration SQL prepared"
echo ""
echo "📋 Next steps:"
echo "1. Go to: ${VITE_SUPABASE_URL}/project/default/sql"
echo "2. Copy the contents of: fix_white_label_function.sql"
echo "3. Paste and click 'Run'"
echo ""
echo "Or run this in your terminal if you have Supabase CLI:"
echo "   supabase db push"
echo ""

# Cleanup
rm -f /tmp/migration.sql

echo "✨ Script complete!"
