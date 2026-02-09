# Edge Functions Deployment Guide

## Problem: Access Token Insufficient Privileges

The provided access token doesn't have the necessary privileges to deploy edge functions programmatically. This is a common security restriction.

## Solution: Deploy via Supabase Dashboard (Recommended)

### Method 1: Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/ctzckttucdjlysiohlwh

2. **Navigate to Edge Functions**
   - Click on "Edge Functions" in the left sidebar

3. **Deploy Each Function**
   
   For each function, click "New Function" or "Deploy" and upload the corresponding folder:

   - **ai-orchestrator**: `supabase/functions/ai-orchestrator/`
   - **ai-smart-analyzer**: `supabase/functions/ai-smart-analyzer/`
   - **ai-credit-coach**: `supabase/functions/ai-credit-coach/`
   - **ai-intelligence-hub**: `supabase/functions/ai-intelligence-hub/`
   - **ai-goal-roadmap**: `supabase/functions/ai-goal-roadmap/`

4. **Configure Environment Variables** (if needed)
   - Set any required environment variables for each function
   - Common variables: API keys, model configurations, etc.

### Method 2: CLI with Interactive Login

```bash
# Login interactively (opens browser)
npx supabase login

# Link project
npx supabase link --project-ref ctzckttucdjlysiohlwh

# Deploy all functions
bash scripts/deploy-edge-functions.sh
```

### Method 3: CLI with Service Role Key

If you have a service role key with admin privileges:

```bash
# Set the service role key (NOT the anon key)
export SUPABASE_ACCESS_TOKEN="your-service-role-key"

# Deploy
bash scripts/deploy-edge-functions.sh
```

## Alternative: Use GitHub Actions

The repository includes a CI/CD workflow that can deploy edge functions automatically when you push to the `main` branch.

### Setup Steps:

1. **Add Secrets to GitHub Repository**
   - Go to: Settings → Secrets and variables → Actions
   - Add these secrets:
     - `SUPABASE_ACCESS_TOKEN`: Your admin access token or service role key
     - `SUPABASE_PROJECT_REF`: `ctzckttucdjlysiohlwh`

2. **Push to Main Branch**
   ```bash
   git add .
   git commit -m "Deploy edge functions"
   git push origin main
   ```

3. **Monitor Deployment**
   - Go to: Actions tab in GitHub
   - Watch the deployment progress

## Manual Deployment Commands

If you have the correct access token:

```bash
# Set your access token
export SUPABASE_ACCESS_TOKEN="your-access-token"

# Deploy individual functions
npx supabase functions deploy ai-orchestrator --project-ref ctzckttucdjlysiohlwh
npx supabase functions deploy ai-smart-analyzer --project-ref ctzckttucdjlysiohlwh
npx supabase functions deploy ai-credit-coach --project-ref ctzckttucdjlysiohlwh
npx supabase functions deploy ai-intelligence-hub --project-ref ctzckttucdjlysiohlwh
npx supabase functions deploy ai-goal-roadmap --project-ref ctzckttucdjlysiohlwh
```

Or use the deployment script:

```bash
bash scripts/deploy-edge-functions.sh
```

## Verify Deployment

After deployment, test the functions:

```bash
# Set environment variables
export VITE_SUPABASE_URL="https://ctzckttucdjlysiohlwh.supabase.co"
export VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"

# Run the test
node scripts/test-ai-realtime.js
```

## Troubleshooting

### Error: "Your account does not have the necessary privileges"

**Solution**: You need a service role key or admin access token, not the publishable (anon) key.

**Where to get it**:
1. Go to: https://supabase.com/dashboard/project/ctzckttucdjlysiohlwh/settings/api
2. Under "Project API keys", copy the `service_role` key (not the `anon` key)
3. Use that as your `SUPABASE_ACCESS_TOKEN`

### Error: "Function already exists"

**Solution**: The function is already deployed. To update it, simply run the deploy command again - it will replace the existing version.

### Error: "Cannot find function"

**Solution**: Make sure you're in the project root directory where the `supabase/functions/` folder exists.

## Required Access Levels

To deploy edge functions, you need one of:
- ✅ Owner or Admin role on the Supabase project
- ✅ Service role API key
- ✅ Personal access token with "Edge Functions" write scope
- ❌ NOT the publishable (anon) key - this is read-only

## Next Steps

Once deployed, verify all functions are running:
1. Check Supabase Dashboard → Edge Functions
2. Each function should show as "Active"
3. Run the test suite: `node scripts/test-ai-realtime.js`
4. View logs in dashboard for any errors
