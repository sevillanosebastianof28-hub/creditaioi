# DNS Configuration for White Label Subdomains

## Overview
To make white label subdomains work automatically (e.g., `clientname.credit-ai.online`), you need to configure DNS records.

## Prerequisites
1. You must own or have access to manage DNS for `credit-ai.online`
2. Your application must be deployed and have a production URL

## DNS Configuration Steps

### Option 1: Wildcard DNS (Recommended)
Set up a wildcard DNS record to automatically route all subdomains:

```
Type: CNAME
Host: *
Value: your-app-domain.com (or your deployment URL)
TTL: 3600
```

**Example for Vercel:**
```
Type: CNAME
Host: *
Value: cname.vercel-dns.com
```

**Example for Netlify:**
```
Type: CNAME
Host: *
Value: your-site.netlify.app
```

**Example for AWS/Cloudflare:**
```
Type: CNAME
Host: *
Value: your-cloudfront-distribution.cloudfront.net
```

### Option 2: Individual Subdomains
If you don't want wildcard DNS, add a CNAME for each subdomain:

```
Type: CNAME
Host: clientname
Value: your-app-domain.com
TTL: 3600
```

## Platform-Specific Configuration

### For Vercel
1. Go to your project settings
2. Navigate to "Domains"
3. Add domain: `*.credit-ai.online`
4. Follow Vercel's DNS instructions
5. Verify the domain

### For Netlify  
1. Go to Site settings → Domain management
2. Add custom domain: `*.credit-ai.online`
3. Follow Netlify's DNS configuration
4. Enable HTTPS

### For Custom Server
1. Configure your web server (Nginx/Apache) to accept wildcard subdomains
2. Point DNS to your server IP
3. Set up SSL certificate with wildcard support (Let's Encrypt supports this)

## SSL/HTTPS Configuration

### Wildcard SSL Certificate
You'll need a wildcard SSL certificate to secure all subdomains:

**Using Let's Encrypt (Free):**
```bash
certbot certonly --dns-cloudflare -d *.credit-ai.online -d credit-ai.online
```

**Or use your hosting provider's automatic SSL:**
- Vercel: Automatic
- Netlify: Automatic  
- Cloudflare: Enable in dashboard

## Verification

### Test DNS Configuration
```bash
# Test if subdomain resolves
nslookup testclient.credit-ai.online

# Or use dig
dig testclient.credit-ai.online
```

### Test in Application
1. Create a test subdomain in White Label settings: `testclient`
2. Publish it
3. Access `https://testclient.credit-ai.online`
4. Should see white-labeled version of the app

## Local Testing (No DNS Required)

For local testing without DNS configuration:
1. Use the query parameter method: `http://localhost:8080/?subdomain=testclient`
2. Or add to `/etc/hosts`:
   ```
   127.0.0.1 testclient.localhost
   ```

## Troubleshooting

### Subdomain doesn't load
- Check DNS propagation (can take up to 48 hours)
- Verify CNAME record is correct
- Check application deployment URL
- Ensure wildcard domain is added to hosting platform

### SSL/HTTPS errors
- Verify wildcard SSL certificate is installed
- Check hosting platform SSL settings
- May need to wait for certificate provisioning

### White label config not applying
- Ensure subdomain is published in the database (`is_published = true`)
- Check browser console for errors
- Verify `get_brand_settings_by_subdomain` function exists in Supabase

## Production Checklist

- [ ] DNS wildcard record configured
- [ ] Wildcard domain added to hosting platform
- [ ] SSL certificate provisioned
- [ ] Test subdomain resolves correctly
- [ ] White label config applies when accessing subdomain
- [ ] Real-time updates working for subdomain users

## Support

If you need help with DNS configuration, contact your DNS provider or hosting platform support.
