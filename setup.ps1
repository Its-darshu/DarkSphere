# DarkSphere - Quick Start Script
# Run this after setting up Firebase and environment files

Write-Host "� DarkSphere Setup" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-Not (Test-Path "backend") -or -Not (Test-Path "frontend")) {
    Write-Host "❌ Error: Please run this script from the darksphere root directory" -ForegroundColor Red
    exit 1
}

# Backend setup
Write-Host "📦 Setting up backend..." -ForegroundColor Yellow
Set-Location backend

if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: backend/.env not found. Copying from .env.example" -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "Please edit backend/.env with your configuration" -ForegroundColor Yellow
}

if (-Not (Test-Path "firebase-service-account.json")) {
    Write-Host "❌ Error: firebase-service-account.json not found in backend directory" -ForegroundColor Red
    Write-Host "Please download it from Firebase Console and place it in the backend folder" -ForegroundColor Red
    exit 1
}

Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend npm install failed" -ForegroundColor Red
    exit 1
}

Set-Location ..

# Frontend setup
Write-Host ""
Write-Host "📦 Setting up frontend..." -ForegroundColor Yellow
Set-Location frontend

if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: frontend/.env not found. Copying from .env.example" -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "Please edit frontend/.env with your Firebase configuration" -ForegroundColor Yellow
}

Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend npm install failed" -ForegroundColor Red
    exit 1
}

Set-Location ..

# Success
Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend/.env and frontend/.env with your configuration" -ForegroundColor White
Write-Host "2. Deploy Firestore and Storage rules:" -ForegroundColor White
Write-Host "   firebase deploy --only firestore:rules,storage" -ForegroundColor Gray
Write-Host "3. Start the backend (Terminal 1):" -ForegroundColor White
Write-Host "   cd backend; npm run dev" -ForegroundColor Gray
Write-Host "4. Start the frontend (Terminal 2):" -ForegroundColor White
Write-Host "   cd frontend; npm run dev" -ForegroundColor Gray
Write-Host "5. Visit http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "📖 See SETUP.md for detailed instructions" -ForegroundColor Cyan
