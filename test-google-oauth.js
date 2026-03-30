#!/usr/bin/env node

/**
 * Test Google OAuth Configuration
 * This script checks if Google OAuth is properly configured in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env file manually
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Checking Google OAuth Configuration...\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('✅ Supabase credentials found');
console.log(`   URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testGoogleOAuth() {
  try {
    // Try to initiate Google OAuth (this will fail if not configured)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        skipBrowserRedirect: true, // Don't actually redirect
      },
    });

    if (error) {
      console.error('\n❌ Google OAuth is NOT configured properly');
      console.error('   Error:', error.message);
      console.error('\n📖 Follow the setup guide: GOOGLE_AUTH_SETUP.md');
      console.error('\n   Quick steps:');
      console.error('   1. Go to https://console.cloud.google.com/');
      console.error('   2. Create OAuth credentials');
      console.error('   3. Add credentials to Supabase Dashboard');
      console.error('   4. Go to: https://supabase.com/dashboard/project/vpymxqqjnaasgvauqybl/auth/providers');
      return false;
    }

    if (data?.url) {
      console.log('\n✅ Google OAuth appears to be configured!');
      console.log('   OAuth URL generated successfully');
      console.log('   You should be able to sign in with Google now');
      return true;
    }

    console.log('\n⚠️  Unexpected response from Supabase');
    console.log('   Data:', JSON.stringify(data, null, 2));
    return false;

  } catch (err) {
    console.error('\n❌ Error testing Google OAuth:', err.message);
    return false;
  }
}

testGoogleOAuth().then(success => {
  if (success) {
    console.log('\n🎉 Everything looks good! Try signing in with Google.');
  } else {
    console.log('\n❌ Google Sign-In will NOT work until you complete the setup.');
    console.log('   Read: GOOGLE_AUTH_SETUP.md for instructions');
  }
  process.exit(success ? 0 : 1);
});
