# 🔐 Fix Google Authentication Error

## ❌ Problem
You're getting "Authentication Error - Internal server error" when trying to sign in with Google.

## 🔍 Root Cause
Google OAuth is **NOT configured** in your Supabase project. The code is trying to use Google Sign-In, but Supabase doesn't have the Google OAuth credentials set up.

---

## ✅ Solution: Configure Google OAuth in Supabase

### Step 1: Get Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create a new project (or select existing):**
   - Click "Select a project" → "New Project"
   - Name it "DarkSphere" or similar
   - Click "Create"

3. **Enable Google+ API:**
   - In the search bar, type "Google+ API"
   - Click "Google+ API" → Click "Enable"

4. **Configure OAuth Consent Screen:**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" → Click "Create"
   - Fill in:
     - App name: `DarkSphere`
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Scopes: Skip this (click "Save and Continue")
   - Test users: Add your email (optional for testing)
   - Click "Save and Continue"

5. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `DarkSphere Web Client`
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://localhost:3001
   https://vpymxqqjnaasgvauqybl.supabase.co
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   https://vpymxqqjnaasgvauqybl.supabase.co/auth/v1/callback
   ```
   
   - Click "Create"
   - **COPY** the Client ID and Client Secret (you'll need these!)

---

### Step 2: Configure Supabase

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `vpymxqqjnaasgvauqybl`

2. **Enable Google Auth Provider:**
   - Go to: Authentication → Providers
   - Find "Google" in the list
   - Click to expand it
   - Toggle "Enable Sign in with Google" to **ON**

3. **Add Google Credentials:**
   - **Client ID (for OAuth):** Paste the Client ID from Google Cloud Console
   - **Client Secret (for OAuth):** Paste the Client Secret
   - Click "Save"

4. **Configure Redirect URLs (if needed):**
   - Go to: Authentication → URL Configuration
   - **Site URL:** `http://localhost:3000` (for development)
   - **Redirect URLs:** Add:
     ```
     http://localhost:3000/auth/callback
     http://localhost:3001/auth/callback
     ```

---

### Step 3: Test the Fix

1. **Restart your dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. **Try Google Sign In:**
   - Go to: http://localhost:3000/signin
   - Click "Continue with Google"
   - Should redirect to Google login
   - After signing in, should redirect back to your app

---

## 🎯 Quick Check: Is Google OAuth Configured?

Run this to verify Supabase is configured:

```bash
# Check if Google provider is enabled in Supabase
# (You need to do this in Supabase Dashboard)
```

Go to: https://supabase.com/dashboard/project/vpymxqqjnaasgvauqybl/auth/providers

- [ ] Google provider shows as "Enabled"
- [ ] Client ID is filled in
- [ ] Client Secret is filled in

---

## 🔄 Alternative: Disable Google Sign-In (Temporary Fix)

If you don't want to set up Google OAuth right now, you can temporarily disable it:

### Option A: Hide the Google Button

Edit `app/(auth)/signin/page.tsx`:

```tsx
// Comment out or remove lines 142-166 (the Google button)
{/* 
<div className="relative my-6">
  ... Google button code ...
</div>
*/}
```

### Option B: Show Better Error Message

Update the error handling to be more informative:

```tsx
// In handleGoogleSignin function, line 76:
setError('Google Sign-In is not configured. Please contact the administrator.')
```

---

## 🆘 Still Having Issues?

### Error: "Invalid redirect URL"
**Fix:** Make sure the redirect URL in Google Cloud Console matches EXACTLY:
```
https://vpymxqqjnaasgvauqybl.supabase.co/auth/v1/callback
```

### Error: "Access blocked: This app hasn't been verified"
**Fix:** 
1. In Google Cloud Console → OAuth consent screen
2. Add your Google account as a "Test user"
3. Or publish your app (for production)

### Error: "Invalid client ID"
**Fix:** 
1. Double-check you copied the FULL Client ID from Google
2. No extra spaces or characters
3. Re-save in Supabase

---

## 📋 Summary

**The authentication error happens because:**
1. ❌ Google OAuth credentials are NOT in Supabase
2. ✅ Your code expects Google Sign-In to work
3. ❌ When user clicks "Continue with Google", Supabase can't authenticate

**To fix it, you MUST:**
1. Create Google OAuth credentials in Google Cloud Console
2. Add those credentials to Supabase Dashboard
3. Restart your app

**This will take about 10-15 minutes to set up properly.**

---

Need help? The issue is 100% a missing Google OAuth configuration in Supabase, not your code! 🚀
