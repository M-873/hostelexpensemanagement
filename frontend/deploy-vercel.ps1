# Vercel Frontend Deployment Script for PowerShell
# This script deploys the built frontend to Vercel

$PROJECT_NAME = "hostel-expense-management-frontend"
$DIST_DIR = "dist"

# Check if dist folder exists
if (!(Test-Path $DIST_DIR)) {
    Write-Host "❌ Dist folder not found. Please build the frontend first." -ForegroundColor Red
    exit 1
}

# Create a simple vercel.json for static deployment
$vercelConfig = @"
{
  "version": 2,
  "public": true,
  "github": {
    "enabled": false
  }
}
"@

$vercelConfig | Out-File -FilePath "vercel.json" -Encoding UTF8

# Deploy to Vercel
Write-Host "🚀 Deploying frontend to Vercel..." -ForegroundColor Green

# Try to deploy without authentication first
try {
    npx vercel deploy --prod --name=$PROJECT_NAME --yes --public
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend deployment failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error deploying to Vercel: $_" -ForegroundColor Red
    exit 1
}