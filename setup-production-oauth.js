#!/usr/bin/env node

/**
 * Production Google OAuth Setup Checker
 * Run this after configuring Google OAuth for production
 */

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => readline.question(question, resolve));
}

async function main() {
  console.log('\n🚀 Production Google OAuth Setup Checker\n');
  console.log('==========================================\n');
  
  const productionUrl = await ask('What is your Vercel production URL? (e.g., https://dark-sphere.vercel.app)\n> ');
  
  if (!productionUrl.startsWith('https://')) {
    console.log('\n❌ Production URL must start with https://');
    console.log('   Example: https://your-app.vercel.app\n');
    process.exit(1);
  }
  
  const cleanUrl = productionUrl.trim().replace(/\/$/, ''); // Remove trailing slash
  
  console.log('\n✅ Production URL:', cleanUrl);
  console.log('\n==========================================');
  console.log('📋 CHECKLIST - Do these in order:\n');
  
  console.log('1️⃣  Google Cloud Console Setup:');
  console.log('   Go to: https://console.cloud.google.com/apis/credentials\n');
  console.log('   In "Authorized redirect URIs", ADD:');
  console.log(`   ✓ ${cleanUrl}/auth/callback`);
  console.log('   ✓ https://vpymxqqjnaasgvauqybl.supabase.co/auth/v1/callback\n');
  console.log('   In "Authorized JavaScript origins", ADD:');
  console.log(`   ✓ ${cleanUrl}`);
  console.log('   ✓ https://vpymxqqjnaasgvauqybl.supabase.co\n');
  
  console.log('2️⃣  Supabase Dashboard Setup:');
  console.log('   Go to: https://supabase.com/dashboard/project/vpymxqqjnaasgvauqybl/auth/url-configuration\n');
  console.log('   In "Redirect URLs", ADD:');
  console.log(`   ✓ ${cleanUrl}/auth/callback\n`);
  console.log('   Set "Site URL" to:');
  console.log(`   ✓ ${cleanUrl}\n`);
  
  console.log('3️⃣  Vercel Environment Variables:');
  console.log('   Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables\n');
  console.log('   Make sure these are set for PRODUCTION:');
  console.log('   ✓ DATABASE_URL');
  console.log('   ✓ NEXT_PUBLIC_SUPABASE_URL');
  console.log('   ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('   ✓ SUPABASE_SERVICE_ROLE_KEY');
  console.log('   ✓ NEXTAUTH_SECRET');
  console.log(`   ✓ NEXTAUTH_URL = ${cleanUrl}`);
  console.log('   ✓ NODE_ENV = production\n');
  
  console.log('4️⃣  Redeploy:');
  console.log('   After making changes, redeploy your app:\n');
  console.log('   Option A: Push a commit');
  console.log('   $ git commit --allow-empty -m "Configure Google OAuth for production"');
  console.log('   $ git push origin main\n');
  console.log('   Option B: Redeploy in Vercel Dashboard\n');
  
  console.log('5️⃣  Test:');
  console.log(`   Visit: ${cleanUrl}/signin`);
  console.log('   Click "Continue with Google"');
  console.log('   Sign in with Google');
  console.log('   Should redirect to your profile ✅\n');
  
  console.log('==========================================');
  console.log('🔍 Copy-Paste Ready URLs:\n');
  console.log('For Google Cloud Console Redirect URIs:');
  console.log(`${cleanUrl}/auth/callback`);
  console.log('https://vpymxqqjnaasgvauqybl.supabase.co/auth/v1/callback\n');
  console.log('For Google Cloud Console JavaScript Origins:');
  console.log(cleanUrl);
  console.log('https://vpymxqqjnaasgvauqybl.supabase.co\n');
  console.log('For Supabase Redirect URL:');
  console.log(`${cleanUrl}/auth/callback\n`);
  console.log('For Vercel NEXTAUTH_URL:');
  console.log(cleanUrl);
  console.log('==========================================\n');
  
  readline.close();
}

main().catch(err => {
  console.error('Error:', err);
  readline.close();
  process.exit(1);
});
