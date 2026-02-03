# Production Deployment Guide

## Quick Start
This guide helps you deploy the white-label credit repair platform with automatic subdomain support.

## Prerequisites
- Domain name (e.g., `credit-ai.online`)
- Access to domain DNS settings
- Hosting platform account (Vercel recommended)
- Supabase project (already configured)

## Step 1: Deploy Application

### Using Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Note the deployment URL (e.g., your-app.vercel.app)
```

### Using Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod
```

## Step 2: Configure Custom Domain

### Vercel
```bash
# Add your custom domain
vercel domains add credit-ai.online

# The CLI will show DNS records to add
```

### Expected DNS Configuration
Add these records at your DNS provider:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

## Step 3: Enable Wildcard Subdomain

### Critical: Wildcard DNS
Add this record to enable automatic subdomains:

```
Type: CNAME
Name: *
Value: cname.vercel-dns.com  (or your deployment URL)
TTL: Auto
```

**This single DNS record enables all user subdomains automatically!**

### Vercel Configuration
```bash
# Add wildcard domain
vercel domains add "*.credit-ai.online"

# Verify
vercel domains ls
```

You should see:
```
*.credit-ai.online  Ready
credit-ai.online    Ready
```

## Step 4: SSL/TLS Setup

### Automatic SSL (Vercel/Netlify)
Both platforms automatically provision SSL certificates for:
- Main domain: `credit-ai.online`
- Wildcard: `*.credit-ai.online`

No additional configuration needed!

### Verify SSL
```bash
# Check SSL certificate
curl -vI https://test123.credit-ai.online 2>&1 | grep -i "subject:"
```

Should show wildcard certificate: `*.credit-ai.online`

## Step 5: Environment Variables

### Set in Hosting Platform
```bash
# Vercel
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Or use .env file and redeploy
vercel --prod
```

### Required Variables
```env
VITE_SUPABASE_URL=https://ctzckttucdjlysiohlwh.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 6: Test Subdomain System

### 1. Test Main Domain
```
https://credit-ai.online
```
Should load the main application.

### 2. Create Test White Label
1. Login to your platform
2. Go to Settings → White Label
3. Enter subdomain: `testclient`
4. Click "Preview Portal Now" (instant preview)
5. Click "Publish Portal"

### 3. Test Production Subdomain
After DNS propagates (5-60 minutes):
```
https://testclient.credit-ai.online
```

Should show white-labeled portal with custom branding!

### 4. Test Multiple Subdomains
Create more white labels:
- `agency1.credit-ai.online`
- `mycreditpro.credit-ai.online`
- `creditexperts.credit-ai.online`

All work automatically without additional DNS configuration!

## Step 7: Verify Real-time Updates

1. Open a white-label portal
2. In another tab, change branding settings
3. Portal should update automatically (no refresh needed)

## Troubleshooting

### Subdomain Returns 404
**Possible causes:**
1. DNS not propagated yet (wait 5-60 minutes)
2. Wildcard DNS record missing
3. Hosting platform doesn't have wildcard domain configured

**Check:**
```bash
# Verify DNS propagation
dig anyrandom.credit-ai.online

# Should return your app's IP/hostname
```

**Fix:**
```bash
# Vercel: Add wildcard domain
vercel domains add "*.credit-ai.online"

# Ensure DNS has wildcard CNAME
```

### SSL Certificate Error
**Cause:** Wildcard SSL not provisioned

**Fix:**
- Vercel/Netlify: Automatic, wait 5-10 minutes
- Custom: Generate wildcard certificate

```bash
# Let's Encrypt
certbot certonly --manual -d "*.credit-ai.online" -d "credit-ai.online"
```

### "Site Can't Be Reached"
**Debugging:**
```bash
# 1. Check DNS
nslookup testsubdomain.credit-ai.online

# 2. Check if main domain works
curl -I https://credit-ai.online

# 3. Check wildcard
curl -I https://randomtest123.credit-ai.online
```

**Common issue:** Wildcard DNS not added. Add `CNAME * → your-app.vercel.app`

### Preview Works but Production Doesn't
**Cause:** DNS wildcard not configured

**User experience:**
- Preview (`?subdomain=name`): ✅ Always works
- Production (`name.credit-ai.online`): ❌ Until DNS configured

**Solution:** Complete Step 3 above

## Platform-Specific Configuration

### Cloudflare (DNS Provider)
```
Dashboard → DNS → Records

Add:
Type: CNAME
Name: *
Content: your-app.vercel.app
Proxy: ON (orange cloud)
TTL: Auto
```

**Important:** Enable "Proxied" for DDoS protection and caching

### GoDaddy
```
DNS Management → Add Record

Type: CNAME
Host: *
Points to: your-app.vercel.app
TTL: 600
```

### Namecheap
```
Advanced DNS

Type: CNAME Record
Host: *
Value: your-app.vercel.app
TTL: Automatic
```

## Performance Optimization

### Enable Caching (Vercel)
Automatically enabled. Vercel caches static assets globally.

### Enable Caching (Cloudflare)
```
Dashboard → Caching → Configuration

Cache Level: Standard
Browser Cache TTL: 4 hours
```

### Edge Functions (Optional)
For faster subdomain detection:

```typescript
// vercel.json
{
  "functions": {
    "src/pages/**/*.tsx": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

## Monitoring

### Check Subdomain Usage
```sql
-- In Supabase SQL Editor
SELECT subdomain, company_name, is_published, created_at
FROM brand_settings
WHERE is_published = true
ORDER BY created_at DESC;
```

### Monitor DNS Health
Use external services:
- https://dnschecker.org
- https://www.whatsmydns.net

### SSL Certificate Expiry
Vercel/Netlify: Auto-renewed, no action needed

## Cost Breakdown

| Item | Provider | Cost |
|------|----------|------|
| Domain | Namecheap | ~$10/year |
| Hosting | Vercel Pro | $20/month |
| Database | Supabase Pro | $25/month |
| Wildcard SSL | Let's Encrypt | Free |
| Wildcard DNS | Any provider | Free |

**Total:** ~$45/month + $10/year for unlimited white-label subdomains!

## Security Checklist

- [x] Enable HTTPS for all subdomains
- [x] Set proper CORS headers
- [x] Configure RLS policies in Supabase
- [x] Use environment variables for secrets
- [x] Enable Vercel/Netlify DDoS protection
- [x] Set up Cloudflare WAF (optional)
- [x] Regular security updates

## Next Steps

1. ✅ Complete deployment (Steps 1-5)
2. ✅ Test subdomain system (Step 6)
3. 📧 Set up email for custom domains
4. 🎨 Create white label templates for clients
5. 📊 Set up analytics tracking
6. 💳 Configure billing for white label feature

## Support

- **DNS Issues:** Check with your DNS provider
- **Deployment:** Check hosting platform docs
- **Application:** Check logs in Vercel/Netlify dashboard
- **Database:** Check Supabase dashboard

## Quick Reference Commands

```bash
# Check DNS
dig subdomain.credit-ai.online

# Check SSL
openssl s_client -connect subdomain.credit-ai.online:443

# Deploy
vercel --prod

# Check domains
vercel domains ls

# View logs
vercel logs

# Test locally with subdomain
http://localhost:8080/?subdomain=testclient
```

---

**That's it!** Once DNS is configured, users can create unlimited white-label portals by just entering a subdomain name. No technical setup required per user! 🚀
