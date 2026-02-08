# 🎯 QUICK START - Production Deployment

## Prerequisites
- Node.js 18+ installed
- npm or bun installed
- Supabase project created
- Production environment ready

## 1-Minute Deployment 🚀

### Step 1: Environment Setup (30 seconds)
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your production values
nano .env
```

Required values:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### Step 2: Install & Build (30 seconds)
```bash
npm install
npm run build
```

### Step 3: Deploy (varies by platform)

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod
```

**AWS Amplify:**
```bash
amplify publish
```

## Verification ✅

After deployment:
1. Visit your production URL
2. Check browser console for CSP warnings
3. Test login/authentication
4. Verify AI features work
5. Check error tracking (if configured)

## Common Issues

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working
- Ensure all variables start with `VITE_`
- Restart dev server after changes
- Check .env file is not in .gitignore locally

### CSP Blocking Resources
- Check browser console for CSP violations
- Update CSP in index.html if needed
- Verify all CDN URLs are whitelisted

## Production Checklist

Before going live:
- [ ] New production API keys generated
- [ ] Environment variables set in hosting platform
- [ ] Database migrations applied
- [ ] RLS policies tested
- [ ] Error tracking configured
- [ ] Analytics configured
- [ ] Domain DNS configured
- [ ] SSL certificate active

## Getting Help

- Review: `DEPLOYMENT_GUIDE.md`
- Security: `SECURITY.md`
- Full Checklist: `PRODUCTION_READY.md`

## Emergency Contacts

- Technical Issues: dev-team@creditai.com
- Security Issues: security@creditai.com
- Supabase Support: support@supabase.io

---

**You're ready to ship! 🚀**
