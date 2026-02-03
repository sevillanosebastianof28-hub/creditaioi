# Credit AI - White-Label Credit Repair Platform

## 🚀 Overview

A comprehensive credit repair SaaS platform with **real-time white-label subdomain support**. Agencies can create unlimited branded client portals with automatic subdomain provisioning - no manual DNS configuration needed per client!

## ✨ Key Features

### White-Label System
- **Automatic Subdomain Generation**: Users just enter a subdomain name (e.g., "mycreditpro")
- **Instant Preview**: Test portal with `?subdomain=name` parameter
- **Production URLs**: `https://subdomain.credit-ai.online` (after one-time DNS setup)
- **Real-time Updates**: Changes to branding reflect instantly across all sessions
- **Custom Branding**: Logo, colors, company name, support info, custom CSS
- **DNS Status Checker**: Visual indicator showing if production URL is ready

### Credit Repair Tools
- AI-powered dispute letter generation
- Credit score tracking and simulation
- Document parsing and analysis
- Multi-bureau support (Equifax, Experian, TransUnion)
- Round-based dispute management
- Outcome tracking and analytics

### User Roles
- **Agency Owners**: Full platform access, white-label configuration
- **Virtual Assistants**: Client management, task execution
- **Clients**: Personal dashboard, dispute tracking, document uploads

## 🏗️ Project Structure

```
src/
├── components/
│   ├── settings/
│   │   ├── SubdomainSettings.tsx    # White-label subdomain configuration
│   │   ├── BrandingSettings.tsx     # Logo, colors, company info
│   │   └── DNSStatus.tsx            # DNS configuration checker
│   └── ...
├── hooks/
│   ├── useSubdomainDetection.ts     # Automatic subdomain detection
│   ├── useBrandSettings.ts          # Real-time brand settings
│   └── ...
├── contexts/
│   └── BrandContext.tsx             # Global white-label state
└── pages/
    └── Settings.tsx                 # White-label management UI

docs/
├── DEPLOYMENT_GUIDE.md              # Production deployment steps
├── SUBDOMAIN_SETUP.md               # Subdomain system documentation
└── DNS_CONFIGURATION.md             # DNS setup instructions

supabase/
└── migrations/
    ├── 20260203000001_*.sql         # Enable realtime on brand_settings
    ├── 20260203000002_*.sql         # Real-time policies
    ├── 20260203000003_*.sql         # Fix RLS policies
    └── 20260203000004_*.sql         # Auto-apply policy fixes
```

## 🚦 Quick Start

### Development
```sh
# Clone repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start dev server
npm run dev
```

### Test White-Label Locally
1. Navigate to Settings → White Label
2. Enter subdomain: `testclient`
3. Configure branding (logo, colors, company name)
4. Click "Preview Portal Now"
5. New tab opens: `http://localhost:8080/?subdomain=testclient`
6. See your custom branding applied! 🎨

## 🌐 Production Deployment

### One-Time DNS Setup (Platform Admin)
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete instructions.

**TL;DR:**
1. Deploy to Vercel/Netlify
2. Add custom domain: `credit-ai.online`
3. Add wildcard DNS: `CNAME * → your-app.vercel.app`
4. Done! All user subdomains work automatically ✅

### User Experience (No DNS Required)
Users creating white-label portals:
1. Go to Settings → White Label
2. Enter subdomain name
3. Click "Publish Portal"
4. **Instant preview** with `?subdomain` parameter
5. **Production URL** works automatically: `https://their-name.credit-ai.online`

No DNS configuration needed per user!

## 🔧 Technologies

- **Frontend**: React, TypeScript, Vite
- **UI**: shadcn-ui, Tailwind CSS
- **Database**: Supabase (PostgreSQL with real-time)
- **AI**: OpenAI GPT-4 integration
- **Hosting**: Vercel (recommended), Netlify, or custom
- **Domain**: Wildcard DNS for automatic subdomains

## 📖 Documentation

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**: Complete production deployment
- **[SUBDOMAIN_SETUP.md](./SUBDOMAIN_SETUP.md)**: Subdomain system architecture
- **[DNS_CONFIGURATION.md](./DNS_CONFIGURATION.md)**: Platform-specific DNS setup
- **[REALTIME_WHITELABEL_IMPLEMENTATION.md](./REALTIME_WHITELABEL_IMPLEMENTATION.md)**: Real-time system details

## 🔐 Security

- Row-Level Security (RLS) policies on all tables
- Agency isolation (users only see their own data)
- Secure authentication via Supabase Auth
- Environment variables for sensitive data
- HTTPS enforced on all subdomains

## 🎯 White-Label Features

### For Agency Owners
- Unlimited white-label portals
- Custom branding per portal
- Real-time preview before publishing
- DNS status checking
- Client isolation and management

### For Clients
- Branded login experience
- Custom company branding
- Personalized support info
- Seamless experience across all pages

## 📊 Database Schema

Key tables:
- `brand_settings`: White-label configurations (subdomain, colors, logos)
- `profiles`: User accounts and roles
- `clients`: Credit repair clients
- `disputes`: Dispute tracking
- `credit_reports`: Credit data storage

Real-time enabled on: `brand_settings` (instant updates across sessions)

## 🧪 Testing

### Local White-Label Testing
```bash
# Start dev server
npm run dev

# Test with subdomain parameter
http://localhost:8080/?subdomain=test

# Create brand settings in UI first!
```

### Production Testing
```bash
# Check DNS propagation
dig random.credit-ai.online

# Test subdomain
curl -I https://testclient.credit-ai.online

# Check SSL
openssl s_client -connect testclient.credit-ai.online:443
```

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test locally with `?subdomain=test`
4. Push changes (auto-deploys to production)
5. Verify in production

## 📝 Environment Variables

Required in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🆘 Troubleshooting

### Subdomain Not Working
1. Check DNS propagation: https://dnschecker.org
2. Verify wildcard DNS record exists
3. Check Supabase realtime is enabled
4. View browser console for errors

### Real-time Updates Not Working
1. Check `brand_settings` table has realtime enabled
2. Verify RLS policies allow SELECT
3. Check WebSocket connection in browser devtools
4. Ensure `REPLICA IDENTITY FULL` is set

### "Site Can't Be Reached"
1. Try preview mode: `?subdomain=name` (always works)
2. Check if DNS wildcard is configured
3. Wait for DNS propagation (5-60 minutes)
4. Verify hosting platform has wildcard domain added

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **DNS Help**: Check [DNS_CONFIGURATION.md](./DNS_CONFIGURATION.md)

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ using React, Supabase, and modern web technologies**
