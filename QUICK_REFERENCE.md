# 🚀 Quick Reference: White-Label Subdomain System

## For End Users (Agency Owners)

### Create a White-Label Portal
1. Login → Settings → White Label
2. Enter subdomain: `yourname`
3. Upload logo, set colors
4. Click "**Preview Portal Now**" (instant preview)
5. Click "**Publish Portal**"

**Your clients access:** `https://yourname.credit-ai.online`

### Test Your Portal
**Method 1: Instant Preview** (works now)
- Click "Preview Portal Now" button
- Opens with `?subdomain=yourname` parameter

**Method 2: Production URL** (after DNS setup)
- `https://yourname.credit-ai.online`

---

## For Platform Admins

### One-Time DNS Setup

**Required DNS Records:**
```
Type: CNAME
Name: *
Value: your-app.vercel.app
```

**Commands:**
```bash
# Vercel
vercel domains add "*.credit-ai.online"

# Check
dig random.credit-ai.online
```

**Result:** All user subdomains work automatically!

---

## Testing Checklist

### Local Testing ✅
- [ ] Start: `npm run dev`
- [ ] Create subdomain in Settings
- [ ] Click "Preview Portal Now"
- [ ] Verify custom branding appears

### Production Testing
- [ ] Deploy application
- [ ] Add wildcard DNS
- [ ] Wait 5-60 minutes for propagation
- [ ] Test: `https://test.credit-ai.online`
- [ ] Verify SSL certificate
- [ ] Check DNS status indicator

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Preview doesn't show branding | Save changes first, then preview |
| Production URL unreachable | Check DNS propagation, use preview mode |
| Real-time not updating | Check browser console, verify WebSocket |
| DNS status shows "not configured" | Normal on localhost or before DNS setup |

---

## Key URLs

- **Docs:** [SUBDOMAIN_SETUP.md](./SUBDOMAIN_SETUP.md)
- **Deploy:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **DNS:** [DNS_CONFIGURATION.md](./DNS_CONFIGURATION.md)
- **Summary:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## Architecture at a Glance

```
User enters subdomain → Saves to database → Two access methods:
1. Preview: ?subdomain=name (instant)
2. Production: https://name.credit-ai.online (after DNS)

Auto-detection → Load config → Apply branding → Real-time updates
```

---

## Support Commands

```bash
# Check DNS
dig subdomain.credit-ai.online

# Check SSL
curl -I https://subdomain.credit-ai.online

# Test locally
http://localhost:8080/?subdomain=test

# Deploy
vercel --prod

# View logs
vercel logs
```

---

**Everything is automated after the one-time DNS setup!** 🎉
