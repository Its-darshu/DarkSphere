# Vercel Environment Variables Setup Script
# Run this after installing Vercel CLI: npm i -g vercel

# Navigate to frontend directory
cd frontend

# Add environment variables (requires Vercel CLI authentication)
vercel env add VITE_FIREBASE_API_KEY production
# When prompted, paste: AIzaSyBu65PEeiKhgPKdGIi_rscIiC2hVpYhul4

vercel env add VITE_FIREBASE_AUTH_DOMAIN production
# When prompted, paste: darksphere-369.firebaseapp.com

vercel env add VITE_FIREBASE_PROJECT_ID production
# When prompted, paste: darksphere-369

vercel env add VITE_FIREBASE_STORAGE_BUCKET production
# When prompted, paste: darksphere-369.firebasestorage.app

vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
# When prompted, paste: 674125979191

vercel env add VITE_FIREBASE_APP_ID production
# When prompted, paste: 1:674125979191:web:0e6b6c5b40f00d352e69b2

vercel env add VITE_API_URL production
# When prompted, paste: http://localhost:5000 (update to Railway URL later)

Write-Host "✅ All environment variables added!"
Write-Host "🔄 Now run: vercel --prod"
