#!/usr/bin/env node

/**
 * Comprehensive Google OAuth Debug Tool
 * Checks all the configuration points for Google Sign-In
 */

console.log('\n🔍 Google OAuth Configuration Checker\n');
console.log('=====================================\n');

// Check 1: Environment Variables
console.log('1️⃣  Checking Environment Variables...');
const fs = require('fs');
const envPath = require('path').join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.log('   ❌ .env file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    env[key] = value;
  }
});

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXTAUTH_SECRET',
  'DATABASE_URL'
];

let allEnvVarsPresent = true;
requiredEnvVars.forEach(varName => {
  if (env[varName]) {
    console.log(`   ✅ ${varName}: Set`);
  } else {
    console.log(`   ❌ ${varName}: Missing`);
    allEnvVarsPresent = false;
  }
});

if (!allEnvVarsPresent) {
  console.log('\n❌ Some environment variables are missing!\n');
  process.exit(1);
}

// Check 2: Supabase Connection
console.log('\n2️⃣  Testing Supabase Connection...');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

(async () => {
  try {
    // Try to sign in with OAuth to check if provider is enabled
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.log('   ❌ Google provider error:', error.message);
      console.log('   → Check Supabase Dashboard: Authentication → Providers → Google');
    } else if (data?.url) {
      console.log('   ✅ Google OAuth provider is enabled');
      console.log('   ✅ Supabase is generating OAuth URLs');
    }
  } catch (err) {
    console.log('   ❌ Supabase error:', err.message);
  }

  // Check 3: Database Connection
  console.log('\n3️⃣  Testing Database Connection...');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const userCount = await prisma.user.count();
    console.log(`   ✅ Database connected`);
    console.log(`   ✅ Users in database: ${userCount}`);
    await prisma.$disconnect();
  } catch (err) {
    console.log('   ❌ Database error:', err.message);
    console.log('   → Check DATABASE_URL in .env');
  }

  // Check 4: Configuration Summary
  console.log('\n4️⃣  Configuration Summary:');
  console.log(`   Supabase URL: ${env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(`   Auth callback: http://localhost:3000/auth/callback`);
  
  // Check 5: What to do next
  console.log('\n5️⃣  Required Google Cloud Console Setup:\n');
  console.log('   Go to: https://console.cloud.google.com/apis/credentials\n');
  console.log('   In your OAuth 2.0 Client, you MUST have:\n');
  console.log('   📍 Authorized redirect URIs:');
  console.log('      • http://localhost:3000/auth/callback');
  console.log('      • http://localhost:3001/auth/callback');
  console.log(`      • ${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`);
  console.log('\n   📍 Authorized JavaScript origins:');
  console.log('      • http://localhost:3000');
  console.log('      • http://localhost:3001');
  console.log(`      • ${env.NEXT_PUBLIC_SUPABASE_URL}`);
  
  console.log('\n6️⃣  Common Issues:\n');
  console.log('   ❌ "Internal server error" = Missing localhost redirect URIs in Google Console');
  console.log('   ❌ "Invalid redirect" = Typo in redirect URL or not saved properly');
  console.log('   ❌ "Origin not allowed" = Missing JavaScript origin in Google Console');
  
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('✅ If all checks passed, add the localhost URLs to Google Cloud Console!');
  console.log('════════════════════════════════════════════════════════════\n');
  
  process.exit(0);
})();
