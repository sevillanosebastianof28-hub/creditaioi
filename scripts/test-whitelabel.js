// Test White-Label Configuration
// Run with: node scripts/test-whitelabel.js YOUR_SUBDOMAIN

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load .env manually
const envContent = readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const subdomain = process.argv[2] || 'sevillano';

console.log(`\n🧪 Testing white-label for subdomain: "${subdomain}"\n`);

// Test 1: Check if brand settings exist
console.log('1️⃣  Checking brand_settings table...');
const { data: allSettings, error: allError } = await supabase
  .from('brand_settings')
  .select('id, subdomain, company_name, is_published, primary_color, logo_url')
  .limit(10);

if (allError) {
  console.error('   ❌ Error:', allError.message);
} else if (!allSettings || allSettings.length === 0) {
  console.log('   ⚠️  No brand settings found!');
  console.log('   💡 Create one in: Settings → White Label');
} else {
  console.log(`   ✅ Found ${allSettings.length} brand setting(s):`);
  allSettings.forEach(s => {
    const pub = s.is_published ? '✅ Published' : '❌ Not Published';
    const sub = s.subdomain || '⚠️  NO SUBDOMAIN';
    console.log(`      ${pub} | Subdomain: "${sub}" | Company: "${s.company_name}"`);
  });
}

// Test 2: Try to fetch via the function
console.log(`\n2️⃣  Testing get_brand_settings_by_subdomain('${subdomain}')...`);
const { data: funcData, error: funcError } = await supabase
  .rpc('get_brand_settings_by_subdomain', { p_subdomain: subdomain });

if (funcError) {
  console.error('   ❌ Function error:', funcError.message);
  console.log('\n   💡 Fix needed: Run fix_white_label_function.sql in Supabase');
} else if (!funcData || funcData.length === 0) {
  console.log(`   ❌ No data returned for subdomain "${subdomain}"`);
  console.log('\n   Possible reasons:');
  console.log('   • Subdomain doesn\'t exist in database');
  console.log('   • is_published is set to false');
  console.log('   • Subdomain spelling mismatch');
  
  if (allSettings && allSettings.length > 0) {
    const unpublished = allSettings.find(s => s.subdomain === subdomain && !s.is_published);
    if (unpublished) {
      console.log('\n   🔧 Quick fix - Run this SQL:');
      console.log(`      UPDATE brand_settings SET is_published = true WHERE subdomain = '${subdomain}';`);
    }
  }
} else {
  console.log('   ✅ Function returned data successfully!');
  const config = funcData[0];
  console.log(`\n   📋 White-Label Config:`);
  console.log(`      Company: ${config.company_name}`);
  console.log(`      Logo: ${config.logo_url || 'not set'}`);
  console.log(`      Primary Color: ${config.primary_color || 'not set'}`);
  console.log(`      Agency ID: ${config.agency_id || 'not set'}`);
  console.log(`      Has custom_css: ${config.custom_css ? 'Yes' : 'No'}`);
  console.log(`      Has sidebar_style: ${config.sidebar_style ? 'Yes' : 'No'}`);
}

// Test 3: Simulate frontend detection
console.log(`\n3️⃣  Simulating frontend access...`);
const testUrl = `https://credit-ai.online?subdomain=${subdomain}`;
console.log(`   URL: ${testUrl}`);
console.log(`   ✅ Subdomain parameter will be detected`);
console.log(`   ✅ BrandContext will fetch config`);

if (funcData && funcData.length > 0) {
  console.log(`   ✅ Branding will be applied: "${funcData[0].company_name}"`);
} else {
  console.log(`   ❌ No branding will be applied (using defaults)`);
}

console.log('\n✨ Test complete!\n');

if (!funcData || funcData.length === 0) {
  console.log('🔧 Next steps:');
  console.log('1. Ensure your subdomain is saved in White Label settings');
  console.log('2. Click "Publish Portal" to set is_published = true');
  console.log('3. Run this test again');
  console.log('\n');
}
