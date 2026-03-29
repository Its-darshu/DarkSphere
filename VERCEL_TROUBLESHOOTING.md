# 🔍 Vercel Deployment Troubleshooting

## ✅ Build Test: PASSED Locally

Your build works fine locally! The issue is likely with:
1. Environment variables in Vercel
2. Prisma configuration for production
3. Vercel settings

---

## 🚨 Common Vercel Deployment Issues

### Issue 1: Missing Environment Variables
**Symptoms:**
- Build fails with "DATABASE_URL is not defined"
- Runtime errors about missing config

**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Ensure ALL 5 variables are set:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NODE_ENV`
3. Make sure each has checkmarks for: Production, Preview, Development
4. Redeploy after adding variables

---

### Issue 2: Prisma Generate Fails
**Symptoms:**
- "Cannot find module '@prisma/client'"
- "Prisma Client could not be generated"

**Fix:**
Your build script already has `prisma generate` ✅
But if it still fails, update vercel.json:

```json
{
  "version": 2,
  "buildCommand": "prisma generate && next build",
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

---

### Issue 3: Server-Only Imports
**Symptoms:**
- "Module not found: Can't resolve 'server-only'"
- Build fails on importing server files

**Fix:**
Install missing dependency:
```bash
npm install server-only
```

---

### Issue 4: Middleware Issues
**Symptoms:**
- "Middleware is not defined"
- 500 errors on protected routes

**Check:**
Your middleware.ts should export properly ✅

---

### Issue 5: Database Connection
**Symptoms:**
- Build succeeds but runtime errors
- "P1001: Can't reach database server"

**Fix:**
1. Verify DATABASE_URL format in Vercel:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
2. Check Supabase project is not paused
3. Verify connection pooling: Use "Transaction" mode connection string

---

### Issue 6: Outdated vercel.json
**Problem:**
Your vercel.json references `@database_url` (old Vercel Postgres syntax)

**Fix:**
Update vercel.json to:

```json
{
  "version": 2,
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

Remove the `env` section - use Vercel Dashboard instead!

---

## 🔧 Quick Fix Steps

### Step 1: Update vercel.json
```bash
# I'll update this for you!
```

### Step 2: Clear Vercel Cache
1. Go to Vercel Dashboard
2. Your Project → Settings → General
3. Scroll to "Build & Development Settings"
4. Check "Automatically expose System Environment Variables"

### Step 3: Redeploy
```bash
git push origin main
```

Or in Vercel Dashboard:
- Go to Deployments
- Click "..." on latest deployment
- Click "Redeploy"

---

## 📊 Deployment Checklist

Before deploying, verify:

- [ ] All 5 environment variables set in Vercel
- [ ] Each variable has Production/Preview/Development checked
- [ ] DATABASE_URL uses "Transaction mode" connection string
- [ ] Supabase project is active (not paused)
- [ ] vercel.json doesn't reference old env syntax
- [ ] Build passes locally (`npm run build`)

---

## 🆘 Still Having Issues?

### Get Deployment Logs:
1. Go to Vercel Dashboard
2. Click on failed deployment
3. Check "Build Logs" tab
4. Look for the actual error message

### Common Error Messages:

**"Module not found: @prisma/client"**
→ Environment variables missing or Prisma generate failed

**"ECONNREFUSED" or "P1001"**
→ DATABASE_URL incorrect or Supabase down

**"Cannot find module 'server-only'"**
→ Run: `npm install server-only`

**"Invalid environment variable"**
→ Check variable names match exactly (case-sensitive)

---

## 🎯 Next Steps

1. I'll fix your vercel.json now
2. Push changes
3. Set environment variables in Vercel
4. Redeploy

Ready? Let's fix it! 🚀
