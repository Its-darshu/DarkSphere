# Add all backend environment variables to Vercel
# Run this from the frontend directory

Write-Host "Adding backend environment variables to Vercel..." -ForegroundColor Cyan

# Cloudinary
Write-Host "`n1. CLOUDINARY_CLOUD_NAME" -ForegroundColor Yellow
vercel env add CLOUDINARY_CLOUD_NAME production
Write-Host "Enter: dg2rrya2l" -ForegroundColor Green

Write-Host "`n2. CLOUDINARY_API_KEY" -ForegroundColor Yellow
vercel env add CLOUDINARY_API_KEY production
Write-Host "Enter: 652455346111745" -ForegroundColor Green

Write-Host "`n3. CLOUDINARY_API_SECRET" -ForegroundColor Yellow
vercel env add CLOUDINARY_API_SECRET production
Write-Host "Enter: MXwZ8PtbDmtfTNr5RTpr0mjq0bM" -ForegroundColor Green

# Firebase Service Account (read from local file)
Write-Host "`n4. FIREBASE_SERVICE_ACCOUNT" -ForegroundColor Yellow
Write-Host "Reading from backend/firebase-service-account.json..." -ForegroundColor Green
$firebaseJson = Get-Content "backend\firebase-service-account.json" -Raw
Write-Output $firebaseJson | vercel env add FIREBASE_SERVICE_ACCOUNT production

# Other backend variables
Write-Host "`n5. REGISTRATION_PASSCODE" -ForegroundColor Yellow
vercel env add REGISTRATION_PASSCODE production
Write-Host "Enter your secret passcode (e.g., MySecret123)" -ForegroundColor Green

Write-Host "`n6. ADMIN_EMAIL" -ForegroundColor Yellow
vercel env add ADMIN_EMAIL production
Write-Host "Enter your Gmail address" -ForegroundColor Green

Write-Host "`n✅ All environment variables added!" -ForegroundColor Green
Write-Host "Now you can test locally with: npm run dev (in backend)" -ForegroundColor Cyan
