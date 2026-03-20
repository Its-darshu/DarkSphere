# Vercel Postgres Setup Guide

This guide walks you through setting up Vercel Postgres for JokeSphere.

## Step 1: Create Vercel Project

1. Go to https://vercel.com/dashboard
2. Click "Create" → "New Project"
3. Import your GitHub repository
4. Click "Deploy"

## Step 2: Create Postgres Database

1. In your Vercel project, go to **Storage** tab
2. Click **"Create Store"** → **"Postgres"**
3. Enter database name: `jokesphere`
4. Select region (closest to your users)
5. Click **"Create SQL Database"**

## Step 3: Copy Connection String

1. Once created, open the database
2. Under **"PostgreSQL"**, find the **`.env.local`** tab
3. Copy the entire `POSTGRES_URL_NON_POOLING` connection string
4. This will be your `DATABASE_URL`

## Step 4: Add Environment Variable

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Click **"Add New"**
3. **Name**: `DATABASE_URL`
4. **Value**: Paste the connection string
5. Click **"Save**

## Step 5: Redeploy

1. Go to **Deployments** tab
2. Click the **three dots** on your latest deployment
3. Click **"Redeploy"**

This will run migrations and set up your database tables.

## Step 6: Verify Setup

1. Once deployed, open your JokeSphere site
2. Try posting a joke
3. Check if it appears in the feed

## Troubleshooting

### Connection Error
- Double-check the `DATABASE_URL` matches exactly
- Make sure environment variable is set in Vercel
- Redeploy after changing variables

### Tables Not Created
```bash
# Run locally first to test
npm install
npm run db:push

# Then push to git and redeploy on Vercel
```

### Need to Reset Database
⚠️ This will delete all data:
1. Go to Vercel Storage → Postgres
2. Click **"Delete Database"**
3. Create a new one and repeat steps

## Monitor Your Database

From your Vercel project:
1. Go to **Storage** → **Postgres**
2. Click **"Open Studio"** to manage data
3. View tables, rows, and query data

## Next Steps

- Customize styling in `tailwind.config.js`
- Add more features (comments, categories, etc.)
- Invite friends to share jokes!

## Need Help?

- Vercel Docs: https://vercel.com/docs/storage/postgres
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs
