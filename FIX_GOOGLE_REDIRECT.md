# 🔥 CRITICAL FIX: Google OAuth Redirect URL Issue

## ❌ THE PROBLEM

Your Supabase Google OAuth is configured, but you're missing the **localhost redirect URLs** in Google Cloud Console!

When you click "Continue with Google":
1. ✅ User clicks "Continue with Google"
2. ✅ Redirects to Google login
3. ✅ User signs in with Google
4. ❌ **Google tries to redirect back but the URL is not authorized!**

---

## ✅ THE FIX: Add Localhost URLs to Google Cloud Console

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Select your project (the one with Client ID: `674125979191-5crvemccuoimiq5gd96tq3rtmvjih9.apps.googleusercontent.com`)
3. Go to: **APIs & Services** → **Credentials**

### Step 2: Edit OAuth 2.0 Client

1. Find your OAuth 2.0 Client ID in the list
2. Click the **pencil icon** (Edit) next to it

### Step 3: Add Missing Redirect URIs

In the **Authorized redirect URIs** section, you need ALL of these:

```
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
https://vpymxqqjnaasgvauqybl.supabase.co/auth/v1/callback
```

**IMPORTANT:** The Supabase URL is there (from your screenshot), but you're missing the localhost ones!

### Step 4: Add JavaScript Origins (if not already there)

In the **Authorized JavaScript origins** section, add:

```
http://localhost:3000
http://localhost:3001
https://vpymxqqjnaasgvauqybl.supabase.co
```

### Step 5: Save

Click **SAVE** at the bottom.

---

## 🔍 WHY THIS HAPPENS

The error "Internal server error" appears because:

1. User completes Google sign-in
2. Google tries to redirect to: `http://localhost:3000/auth/callback?code=...`
3. **But this URL is not in your Google OAuth allowed list!**
4. Google blocks the redirect
5. User never reaches `/auth/callback`
6. The session never gets synced with your backend
7. Result: "Internal server error"

---

## 🧪 TEST THE FIX

After adding the URLs to Google Cloud Console:

1. **Wait 1-2 minutes** (Google needs to propagate the changes)
2. **Clear your browser cookies** for localhost:3000
3. **Try again:**
   - Go to http://localhost:3000/signin
   - Click "Continue with Google"
   - Sign in with Google
   - Should work now! ✅

---

## 🔐 SECURITY NOTE

The URLs you're adding are for **development only**. When you deploy to production:

1. Add your production URL to Google Cloud Console:
   ```
   https://yourdomain.com/auth/callback
   ```
2. Also add it to Supabase → Authentication → URL Configuration → Redirect URLs

---

## 🆘 STILL NOT WORKING?

If you still get errors after adding the URLs, check:

### Browser Console Errors

1. Open DevTools (F12)
2. Go to Console tab
3. Try signing in
4. Look for errors like:
   - "redirect_uri_mismatch"
   - "invalid_redirect"
   - "Origin not allowed"

### Common Mistakes

❌ **Wrong format:**
```
localhost:3000/auth/callback  # WRONG - missing http://
```

✅ **Correct format:**
```
http://localhost:3000/auth/callback  # RIGHT
```

❌ **Extra slash:**
```
http://localhost:3000/auth/callback/  # WRONG - extra trailing slash
```

✅ **No trailing slash:**
```
http://localhost:3000/auth/callback  # RIGHT
```

---

## 📸 SCREENSHOT CHECKLIST

Your Google Cloud Console OAuth client should look like this:

**Authorized JavaScript origins:**
- `http://localhost:3000`
- `http://localhost:3001`
- `https://vpymxqqjnaasgvauqybl.supabase.co`

**Authorized redirect URIs:**
- `http://localhost:3000/auth/callback`
- `http://localhost:3001/auth/callback`
- `https://vpymxqqjnaasgvauqybl.supabase.co/auth/v1/callback`

---

## 🎯 QUICK SUMMARY

**What to do RIGHT NOW:**

1. Go to Google Cloud Console
2. Edit your OAuth 2.0 Client
3. Add `http://localhost:3000/auth/callback` to Authorized redirect URIs
4. Add `http://localhost:3001/auth/callback` to Authorized redirect URIs
5. Save
6. Wait 1 minute
7. Try signing in with Google again

**This should fix it!** 🚀
