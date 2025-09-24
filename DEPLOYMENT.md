# DarkSphere Deployment Guide

## 🚀 Vercel + PostgreSQL Deployment

### Prerequisites
- GitHub account
- Vercel account
- Node.js 18+ installed locally

### Step 1: Prepare Repository
```bash
# Make sure you're in the DarkSphere directory
cd DarkSphere

# Install dependencies
npm install

# Commit all changes
git add .
git commit -m "Prepare for Vercel deployment with PostgreSQL"
git push origin main
```

### Step 2: Deploy to Vercel

1. **Connect GitHub to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in and click "New Project"
   - Import your DarkSphere repository from GitHub

2. **Configure Build Settings:**
   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 3: Set Up Vercel Postgres

1. **Add Postgres Database:**
   - In your Vercel project dashboard
   - Go to "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a database name (e.g., `darksphere-db`)
   - Select region (choose one close to your users)

2. **Get Database Connection:**
   - After creation, go to your database dashboard
   - Copy the connection string from "Settings" → "Connection Pooling"

### Step 4: Configure Environment Variables

In Vercel project settings → Environment Variables, add:

```bash
# Database (Vercel will auto-populate these)
POSTGRES_URL="your-postgres-url"
POSTGRES_PRISMA_URL="your-postgres-prisma-url"
POSTGRES_URL_NO_SSL="your-postgres-url-no-ssl"
POSTGRES_URL_NON_POOLING="your-postgres-url-non-pooling"
POSTGRES_USER="your-postgres-user"
POSTGRES_HOST="your-postgres-host"
POSTGRES_PASSWORD="your-postgres-password"
POSTGRES_DATABASE="your-postgres-database"

# Authentication (IMPORTANT: Change this!)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
BCRYPT_ROUNDS="12"

# App Configuration
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
NODE_ENV="production"
```

### Step 5: Initialize Database Schema

1. **Connect to Database:**
   ```bash
   # Install Vercel CLI if you haven't
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Link your project
   vercel link

   # Connect to your database
   vercel env pull .env.local
   ```

2. **Run Database Migration:**
   - In Vercel dashboard, go to your Postgres database
   - Open "Query" tab
   - Copy and paste the contents of `database/schema.sql`
   - Execute the SQL to create tables, indexes, and triggers

### Step 6: Create Initial Admin User

After deployment, you'll need to create the first admin user:

1. **Generate Admin Security Key:**
   ```bash
   # You can generate this locally or use any secure string generator
   node -e "console.log('ADMIN-' + Math.random().toString(36).substr(2, 8).toUpperCase() + '-' + Date.now().toString(36).toUpperCase())"
   ```

2. **Add to Database:**
   - In Vercel Postgres Query tab, run:
   ```sql
   INSERT INTO security_keys (key_value, key_type) 
   VALUES ('YOUR-GENERATED-ADMIN-KEY', 'admin');
   ```

3. **Register Admin Account:**
   - Visit your deployed app
   - Use the generated security key to register as admin

### Step 7: Verify Deployment

1. **Test Core Features:**
   - ✅ User registration with security keys
   - ✅ User login/logout
   - ✅ Post creation and viewing
   - ✅ Comment system
   - ✅ Like functionality
   - ✅ Admin dashboard
   - ✅ User profiles

2. **Check Performance:**
   - Database queries should be fast (<500ms)
   - Pages should load quickly
   - Real-time features should work

### Step 8: Optional Optimizations

1. **Enable Analytics:**
   ```bash
   npm install @vercel/analytics
   ```

2. **Add Custom Domain:**
   - Go to Vercel project settings
   - Add your custom domain
   - Configure DNS records

3. **Set up Monitoring:**
   - Enable Vercel monitoring
   - Set up error tracking
   - Monitor database usage

## 🔧 Database Schema Migration

Your database includes:
- **Users** - User accounts with profiles and social links
- **Posts** - User posts with automatic like/comment counting
- **Comments** - Nested comments on posts  
- **Likes** - Like system for posts and comments
- **Security Keys** - Registration key management
- **Announcements** - Admin announcements system
- **Triggers** - Auto-update counters and timestamps

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with configurable rounds
- **SQL Injection Protection** - Parameterized queries
- **XSS Protection** - Input sanitization
- **CSRF Protection** - SameSite cookies
- **Security Key System** - Controlled user registration

## 📊 Performance Considerations

- **Connection Pooling** - Vercel Postgres handles this
- **Query Optimization** - Indexed columns for fast lookups
- **Caching** - Consider adding Redis for session storage
- **CDN** - Vercel automatically provides global CDN

## 🚨 Important Production Notes

1. **Change JWT Secret** - Use a secure, random 32+ character string
2. **Monitor Database Usage** - Vercel Postgres has usage limits
3. **Backup Strategy** - Set up regular database backups
4. **Error Monitoring** - Monitor API errors and database issues
5. **Rate Limiting** - Consider adding rate limiting for API endpoints

## 📋 Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Vercel project created and connected
- [ ] Postgres database created
- [ ] Environment variables configured
- [ ] Database schema initialized
- [ ] Admin security key created
- [ ] First admin user registered
- [ ] Core functionality tested
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled (optional)

## 🔄 Migration from localStorage

The current version seamlessly migrates from localStorage to PostgreSQL:
- Existing users can continue using the app
- New registrations go to the database
- Data is gradually migrated as users interact

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify database connections
3. Confirm environment variables
4. Test API endpoints directly
5. Review database query logs

Your DarkSphere platform is now ready for production! 🌟