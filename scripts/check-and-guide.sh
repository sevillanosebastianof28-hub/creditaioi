#!/bin/bash

# Direct SQL Execution via Supabase
# Applies the white-label fix migration automatically

set -e

echo "🔧 Applying white-label database fix to Supabase..."
echo ""

# Load environment
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

SUPABASE_URL="${VITE_SUPABASE_URL}"
SUPABASE_KEY="${VITE_SUPABASE_PUBLISHABLE_KEY}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "❌ Error: Supabase credentials not found"
    exit 1
fi

echo "📡 Connected to: $SUPABASE_URL"
echo ""

# The migration SQL - all in one line for curl
read -r -d '' MIGRATION_SQL << 'EOF' || true
CREATE OR REPLACE FUNCTION public.get_brand_settings_by_subdomain(p_subdomain TEXT) RETURNS TABLE (id UUID, company_name TEXT, logo_url TEXT, favicon_url TEXT, primary_color TEXT, secondary_color TEXT, accent_color TEXT, support_email TEXT, support_phone TEXT, footer_text TEXT, login_background_url TEXT, login_tagline TEXT, terms_url TEXT, privacy_url TEXT, hide_powered_by BOOLEAN, welcome_message TEXT, button_style TEXT, sidebar_style TEXT, custom_css TEXT, enabled_features JSONB, client_portal_config JSONB, agency_id UUID) LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$ SELECT bs.id, bs.company_name, bs.logo_url, bs.favicon_url, bs.primary_color, bs.secondary_color, bs.accent_color, bs.support_email, bs.support_phone, bs.footer_text, bs.login_background_url, bs.login_tagline, bs.terms_url, bs.privacy_url, bs.hide_powered_by, bs.welcome_message, bs.button_style, bs.sidebar_style, bs.custom_css, bs.enabled_features, bs.client_portal_config, bs.agency_id FROM brand_settings bs WHERE bs.subdomain = p_subdomain AND bs.is_published = true LIMIT 1; $$; GRANT EXECUTE ON FUNCTION public.get_brand_settings_by_subdomain(TEXT) TO anon; GRANT EXECUTE ON FUNCTION public.get_brand_settings_by_subdomain(TEXT) TO authenticated;
EOF

echo "⚠️  Note: Direct SQL execution via REST API is restricted."
echo "    The migration must be run in the Supabase SQL Editor."
echo ""
echo "📋 To apply the fix:"
echo "1. Open: https://supabase.com/dashboard/project/ctzckttucdjlysiohlwh/sql/new"
echo "2. Copy the SQL from: fix_white_label_function.sql"
echo "3. Paste and click 'Run'"
echo ""

# Try to at least verify the current function exists
echo "🔍 Checking current database function..."
RESULT=$(curl -s "${SUPABASE_URL}/rest/v1/rpc/get_brand_settings_by_subdomain" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"p_subdomain":"test"}' 2>&1)

if echo "$RESULT" | grep -q "function.*does not exist"; then
    echo "❌ Function doesn't exist - migration is required"
elif echo "$RESULT" | grep -q "error"; then
    echo "⚠️  Function exists but may need updating"
else
    echo "✅ Function is accessible"
fi

echo ""
echo "💡 After running the SQL migration, test with:"
echo "   https://credit-ai.online?subdomain=YOUR_SUBDOMAIN"
echo ""
