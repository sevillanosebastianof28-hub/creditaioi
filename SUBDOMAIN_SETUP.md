# Automatic Subdomain Setup Guide

## Overview
This platform supports automatic white-label subdomain provisioning. Users can create their own branded portal URLs without technical configuration.

## How It Works

### 1. User Perspective (No DNS Required!)
Users in your platform can:
1. Go to Settings → White Label
2. Enter a subdomain name (e.g., "mycreditpro")
3. Click "Publish Portal"
4. **Instantly test** their portal at: `http://localhost:8080/?subdomain=mycreditpro` (development) or the production URL

### 2. Production URLs
Once DNS is configured (one-time setup by platform admin), subdomains automatically work:
- User enters subdomain: `mycreditpro`
- Their portal URL: `https://mycreditpro.credit-ai.online`
- **No additional DNS configuration needed per user**

## One-Time DNS Configuration (Platform Admin Only)

### Prerequisites
- Access to `credit-ai.online` DNS settings
- Hosting platform that supports wildcard routing (Vercel, Netlify, AWS, etc.)

### DNS Setup Steps

#### Option 1: Vercel (Recommended)
```bash
# 1. Add domain to Vercel project
vercel domains add credit-ai.online
vercel domains add *.credit-ai.online

# 2. Configure DNS at your DNS provider (e.g., Cloudflare, Namecheap)
# Add these records:
Type: CNAME
Name: *
Value: cname.vercel-dns.com
TTL: Auto

Type: A
Name: @
Value: 76.76.21.21
TTL: Auto
```

#### Option 2: Cloudflare DNS
```
1. Login to Cloudflare dashboard
2. Select your domain: credit-ai.online
3. Go to DNS → Records
4. Add CNAME record:
   - Type: CNAME
   - Name: *
   - Target: <your-app-hostname>
   - Proxy status: Proxied (orange cloud)
   - TTL: Auto
```

#### Option 3: AWS Route53
```json
{
  "Name": "*.credit-ai.online",
  "Type": "CNAME",
  "TTL": 300,
  "ResourceRecords": [
    {
      "Value": "your-cloudfront-distribution.cloudfront.net"
    }
  ]
}
```

#### Option 4: Traditional DNS Provider (GoDaddy, Namecheap, etc.)
```
Add CNAME Record:
Host: *
Points to: your-app-domain.com
TTL: 600 (or Auto)
```

### SSL/TLS Certificate
Most modern hosting platforms (Vercel, Netlify, Cloudflare) automatically provision SSL certificates for wildcard domains. If using custom infrastructure:

```bash
# Using Let's Encrypt with Certbot
certbot certonly --dns-cloudflare \
  -d credit-ai.online \
  -d *.credit-ai.online
```

## Testing

### 1. Local Development
Users can always test their white-label portal locally:
```
http://localhost:8080/?subdomain=their-subdomain-name
```

### 2. Production Verification
After DNS propagation (5-60 minutes):
```
https://testsubdomain.credit-ai.online
```

### 3. DNS Propagation Check
```bash
# Check if wildcard DNS is working
nslookup anyrandomname.credit-ai.online
dig anyrandomname.credit-ai.online

# Should resolve to your app's IP/hostname
```

## Troubleshooting

### Subdomain Not Working
1. **Check DNS propagation**: Use https://dnschecker.org
2. **Verify wildcard record**: `dig random123.credit-ai.online`
3. **Check SSL certificate**: Ensure wildcard cert includes `*.credit-ai.online`
4. **Hosting platform**: Verify platform supports wildcard routing

### "Site Can't Be Reached"
1. User should test with local URL first: `?subdomain=name`
2. If local works but production doesn't → DNS not configured yet
3. Check if subdomain is published in Settings → White Label

### Real-time Updates Not Working
1. Check Supabase realtime is enabled: `brand_settings` table
2. Verify user has proper permissions (RLS policies)
3. Check browser console for WebSocket connection errors

## Architecture

### Database Schema
```sql
-- brand_settings table
- subdomain (unique)
- company_name
- logo_url
- primary_color, secondary_color, accent_color
- is_published (boolean)
- agency_id (foreign key)
```

### URL Detection Logic
```typescript
// Production: Extract subdomain from hostname
subdomain.credit-ai.online → "subdomain"

// Development: Read from query parameter
localhost:8080/?subdomain=test → "test"
```

### White Label Application
When a subdomain is detected:
1. Fetch brand settings from database
2. Apply custom colors, logo, company name
3. Update favicon and page title
4. Apply custom CSS if provided
5. Listen for real-time updates

## Security

- RLS policies ensure agencies can only modify their own brand settings
- Subdomains must be unique across platform
- Published portals require `is_published = true` flag
- Client authentication still enforced on white-label domains

## Best Practices

1. **Subdomain Naming**:
   - Use lowercase letters and numbers only
   - Hyphens allowed, but not at start/end
   - Min 3 characters, max 63 characters
   - Examples: `acmecredit`, `credit-experts`, `myagency123`

2. **User Communication**:
   - Tell users: "Your portal will be available instantly for testing"
   - Provide the test URL: `?subdomain=their-name`
   - Explain production URL will work once DNS propagates

3. **Monitoring**:
   - Track subdomain usage
   - Monitor DNS health
   - Alert on SSL certificate expiration (if manual)

## Cost Considerations

- **Wildcard DNS**: Usually free with DNS provider
- **Wildcard SSL**: Free with Let's Encrypt or hosting platform
- **Hosting**: Most platforms (Vercel, Netlify) include unlimited subdomains
- **Database**: Real-time subscriptions count as active connections

## Support

For issues with:
- **Platform setup**: Check this guide
- **DNS configuration**: Contact your DNS provider
- **Hosting platform**: Check platform documentation
- **Application bugs**: Check logs and Supabase dashboard
