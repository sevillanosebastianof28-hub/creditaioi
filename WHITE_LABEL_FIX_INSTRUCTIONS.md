# Fix White-Label Branding - Quick Steps

## The Issue
The white-label branding isn't loading because the database function needs to be updated with the correct fields and permissions.

## Solution

### Step 1: Run SQL in Supabase
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** (left sidebar)
4. Copy and paste the contents of `fix_white_label_function.sql`
5. Click **Run**

### Step 2: Verify Your Brand Settings
Run this in Supabase SQL Editor to check your data:
```sql
SELECT subdomain, company_name, is_published, primary_color, logo_url 
FROM brand_settings;
```

**Important:** Make sure:
- ✅ `subdomain` is set (e.g., 'sevillano')
- ✅ `is_published` is `true`
- ✅ `company_name` has a value

If `is_published` is false:
```sql
UPDATE brand_settings 
SET is_published = true 
WHERE subdomain = 'sevillano';
```

### Step 3: Test
1. Visit: `https://credit-ai.online?subdomain=sevillano`
2. Open browser console (F12)
3. Look for logs with 🎨 emoji showing the white-label config being loaded
4. You should see your branding (company name, colors, logo)

## If Still Not Working

Check the console logs for:
1. **"No white-label config found"** → Your subdomain isn't published or doesn't exist
2. **"Error fetching white-label config"** → The SQL function wasn't updated
3. **No logs at all** → Check that you're using the correct URL with `?subdomain=` parameter

## Quick Test Query
Test the function directly in Supabase:
```sql
SELECT * FROM get_brand_settings_by_subdomain('sevillano');
```

This should return your brand settings. If it returns nothing, check Step 2 above.
