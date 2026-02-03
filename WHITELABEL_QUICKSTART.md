# Quick Start: White-Label Real-Time Setup

## 🚀 How to Set Up Your White-Label Portal (NOW WITH REAL-TIME UPDATES!)

### Step 1: Choose Your Subdomain (1 minute)

1. **Navigate to Settings**
   ```
   Dashboard → Settings → White Label → Publish Tab
   ```

2. **Enter Your Subdomain**
   - Type your desired name (e.g., "sevillano28")
   - Only lowercase letters, numbers, and hyphens
   - **✨ NEW**: URL preview appears instantly as you type!

3. **Example Subdomain Names**
   - Your company name: `acmecredit`
   - Your brand: `creditmasters`
   - Your agency: `sevillano28`
   - Client-specific: `phoenixrepair`

### Step 2: Customize Your Branding (2 minutes)

1. **Company Identity** (Identity Tab)
   - Upload your logo
   - Set company name
   - **✨ Real-time**: Changes appear immediately!

2. **Brand Colors** (Colors Tab)
   - Primary: Main brand color
   - Secondary: Background/accents
   - Accent: Buttons/highlights
   - **✨ Real-time**: See colors change as you adjust sliders!

3. **Login Page** (Login Tab)
   - Background image
   - Welcome tagline
   - **✨ Real-time**: Preview updates live!

### Step 3: Publish Your Portal (30 seconds)

1. **Go Back to Publish Tab**
   ```
   Settings → White Label → Publish
   ```

2. **Click "Publish Portal"**
   - Button turns green with rocket icon 🚀
   - **✨ NEW**: Success notification shows your URL
   - **✨ NEW**: Popup asks if you want to open it now

3. **Your Portal URL**
   ```
   https://sevillano28.credit-ai.online
   ```

### Step 4: Test Your Portal (Instant!)

#### Option A: Preview Button (Works Immediately)
1. Click **"Preview Portal Now"** button
2. Opens in new tab with your branding
3. No DNS needed - works instantly!

#### Option B: Production URL (After Publishing)
1. Copy the URL shown
2. Open in new browser/incognito
3. Share with your clients!

---

## 🎯 What's New: Real-Time Features

### Before (Old Way) ❌
- Change subdomain → Save → Refresh page → Check
- Change colors → Save → Reload → Hope it works
- Open new tab → Nothing updates
- No instant feedback

### Now (New Way) ✅
- **Change subdomain** → See URL preview instantly!
- **Change colors** → Watch them apply as you type!
- **Save settings** → All tabs update automatically!
- **Publish portal** → Open it immediately!
- **Edit branding** → Other users see changes in 1 second!

---

## 💡 Real-Time Examples

### Example 1: Change Company Name
```javascript
// You Type:
"Sevillano Credit Solutions"

// System Does (Instantly):
✅ Updates browser title
✅ Updates all open tabs
✅ Updates white-label portal
✅ Shows toast: "Brand settings updated in real-time ✨"
```

### Example 2: Change Primary Color
```javascript
// You Select:
Color: #2563eb (Blue)

// System Does (Instantly):
✅ Applies color to current page
✅ Updates color picker preview
✅ Syncs to other tabs
✅ Updates white-label portal (if published)
✅ No refresh needed!
```

### Example 3: Publish Portal
```javascript
// You Click:
"Publish Portal" button

// System Does:
✅ Saves to database (200ms)
✅ Shows success notification with URL
✅ Asks: "Open portal now?"
✅ Portal is LIVE immediately
✅ Share URL with clients right away!
```

---

## 🔍 How to Verify It's Working

### Test 1: Real-Time Color Update
1. Open two browser tabs
2. Tab 1: Settings → White Label → Colors
3. Tab 2: Dashboard (or any page)
4. Tab 1: Change primary color
5. **Watch Tab 2**: Title bar color updates in 1 second!

### Test 2: Instant Preview
1. Settings → White Label → Publish
2. Enter subdomain: `test123`
3. Click "Preview Portal Now"
4. **Result**: Opens immediately with your branding!
5. No waiting, no DNS setup needed

### Test 3: Cross-User Updates
1. User 1: Logs in, changes company name
2. User 2: Already logged in on different computer
3. **Result**: User 2 sees update within 2 seconds!
4. No manual refresh needed

---

## 📱 Client Experience

### When Your Client Visits Their Portal:

**URL They Visit:**
```
https://sevillano28.credit-ai.online
```

**What They See:**
- ✅ YOUR company name (not "Credit AI")
- ✅ YOUR logo
- ✅ YOUR brand colors
- ✅ YOUR support email/phone
- ✅ YOUR custom login page
- ✅ No "Powered by Credit AI" (if hidden)

**Real-Time Updates:**
- When you change branding, their portal updates automatically
- Open clients see changes within 2 seconds
- Logged out clients see changes on next visit
- No downtime, no manual updates needed

---

## 🎨 Branding Checklist

Before publishing, ensure you've set:

- [ ] **Subdomain** (required)
- [ ] Company Name
- [ ] Logo (header)
- [ ] Favicon (browser tab icon)
- [ ] Primary Color
- [ ] Secondary Color
- [ ] Accent Color
- [ ] Support Email
- [ ] Support Phone
- [ ] Login Background Image
- [ ] Welcome Tagline
- [ ] Footer Text
- [ ] Terms & Privacy URLs
- [ ] Hide "Powered by Credit AI"

**✨ Pro Tip**: You can change all of these AFTER publishing, and updates apply in real-time!

---

## 🌐 Custom Domain (Optional)

Want `portal.yourcompany.com` instead of a subdomain?

### Setup Steps:
1. **Enter Custom Domain**
   ```
   Settings → White Label → Publish → Custom Domain
   Type: portal.yourcompany.com
   ```

2. **Configure DNS** (at your domain registrar)
   ```
   Type: CNAME
   Name: portal
   Value: credit-ai.online
   TTL: 3600
   ```

3. **Wait for Propagation** (24-48 hours)

4. **Test**
   ```
   https://portal.yourcompany.com
   ```

**✨ Note**: Real-time updates work with custom domains too!

---

## 🐛 Troubleshooting

### "My changes aren't showing"

**Solution 1: Check Console**
```javascript
// Press F12 → Console tab
// Should see:
"Brand settings changed (real-time): ..."
"Applied branding immediately: ..."
```

**Solution 2: Hard Refresh**
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

**Solution 3: Check Published Status**
```
Settings → White Label → Publish
Status should show: "Live" with green badge
```

### "Preview button doesn't work"

**Check**:
1. Subdomain is entered (not empty)
2. No spaces or special characters
3. Try incognito mode
4. Check browser console for errors

### "Clients can't access portal"

**Verify**:
1. Portal is Published (green "Live" badge)
2. Subdomain is unique (not already used)
3. URL is correct: `subdomain.credit-ai.online`
4. Try incognito/different browser
5. Check Supabase logs for errors

---

## 📊 What Happens in Real-Time

| Action | Speed | Where It Updates |
|--------|-------|-----------------|
| Save brand settings | < 200ms | Current page |
| Cross-tab sync | < 1s | All your tabs |
| Other users | < 2s | Other logged-in users |
| White-label portal | < 2s | Client portal (if published) |
| Colors/CSS | Instant | As you type |
| Title/favicon | Instant | Current tab |

---

## 🎓 Advanced Tips

### Tip 1: Preview Before Publishing
Use "Preview Portal Now" to test all changes before making them live.

### Tip 2: Gradual Rollout
1. Set up branding but don't publish
2. Test thoroughly with preview
3. Publish when ready
4. Make adjustments (updates in real-time!)

### Tip 3: Multiple Brands
If you manage multiple agencies:
- Each agency gets its own subdomain
- Switch agencies to manage different brands
- All updates are real-time per agency

### Tip 4: A/B Testing Colors
1. Change colors
2. See them live immediately
3. Don't like it? Change again
4. No save/reload cycle

---

## ✅ Success Indicators

You'll know it's working when you see:

1. **Immediate Feedback**
   - Colors change as you adjust sliders
   - Title updates as you type

2. **Toast Notifications**
   - "Brand settings saved successfully"
   - "Brand settings updated in real-time ✨"

3. **Visual Badges**
   - Green "Live" badge when published
   - "Unsaved changes" indicator when editing

4. **Console Messages** (F12 → Console)
   - "Applying white-label config..."
   - "Brand settings changed (real-time)..."

---

## 🚀 Go Live in 3 Minutes!

**Quick Setup:**
```
1. Choose subdomain (30s)
2. Upload logo + set colors (90s)
3. Click Publish (30s)
4. Share URL with clients (instant!)
```

**Your white-label portal is now LIVE with real-time updates!** 🎉

---

**Need Help?** Contact support with your subdomain name and we'll help you troubleshoot.

**Documentation**: See `REALTIME_WHITELABEL_FIX.md` for technical details.
