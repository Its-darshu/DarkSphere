import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL)

async function setupDatabase() {
  try {
    console.log('🚀 Setting up DarkSphere database with Neon serverless driver...')
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          user_type VARCHAR(20) DEFAULT 'user' CHECK (user_type IN ('admin', 'user')),
          bio TEXT,
          location VARCHAR(255),
          website VARCHAR(255),
          social_github VARCHAR(255),
          social_linkedin VARCHAR(255),
          social_twitter VARCHAR(255),
          social_instagram VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
    console.log('✅ Users table created')

    // Create posts table
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          content TEXT NOT NULL,
          author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          likes_count INTEGER DEFAULT 0,
          comments_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
    console.log('✅ Posts table created')

    // Create comments table
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
          author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          likes_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
    console.log('✅ Comments table created')

    // Create likes table
    await sql`
      CREATE TABLE IF NOT EXISTS likes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
          comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, post_id),
          UNIQUE(user_id, comment_id),
          CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
      );
    `
    console.log('✅ Likes table created')

    // Create security_keys table
    await sql`
      CREATE TABLE IF NOT EXISTS security_keys (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key_value VARCHAR(255) UNIQUE NOT NULL,
          key_type VARCHAR(20) NOT NULL CHECK (key_type IN ('admin', 'user')),
          is_used BOOLEAN DEFAULT FALSE,
          used_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          used_at TIMESTAMP WITH TIME ZONE
      );
    `
    console.log('✅ Security keys table created')

    // Create announcements table
    await sql`
      CREATE TABLE IF NOT EXISTS announcements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          announcement_type VARCHAR(20) DEFAULT 'info' CHECK (announcement_type IN ('info', 'warning', 'success')),
          created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
    console.log('✅ Announcements table created')

    // Create user_announcement_dismissals table
    await sql`
      CREATE TABLE IF NOT EXISTS user_announcement_dismissals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
          dismissed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, announcement_id)
      );
    `
    console.log('✅ User dismissals table created')

    // Insert initial security keys
    await sql`
      INSERT INTO security_keys (key_value, key_type) VALUES 
      ('ADMIN-SUPER-ACCESS', 'admin'),
      ('USER-BETA-TESTER', 'user'),
      ('USER-WELCOME-2025', 'user'),
      ('ADMIN-FOUNDER-KEY', 'admin'),
      ('USER-MOBILE-TEST', 'user'),
      ('ADMIN-DB-SETUP', 'admin'),
      ('NEON-OPTIMIZED-ADMIN', 'admin'),
      ('NEON-OPTIMIZED-USER', 'user')
      ON CONFLICT (key_value) DO NOTHING;
    `
    console.log('✅ Initial security keys inserted')

    console.log('🎉 Database setup completed successfully with Neon serverless driver!')
    console.log('Available security keys:')
    console.log('- ADMIN-SUPER-ACCESS (admin)')
    console.log('- USER-BETA-TESTER (user)')
    console.log('- USER-WELCOME-2025 (user)')
    console.log('- ADMIN-FOUNDER-KEY (admin)')
    console.log('- USER-MOBILE-TEST (user)')
    console.log('- ADMIN-DB-SETUP (admin)')
    console.log('- NEON-OPTIMIZED-ADMIN (admin)')
    console.log('- NEON-OPTIMIZED-USER (user)')

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    throw error
  }
}

setupDatabase()