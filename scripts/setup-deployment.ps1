# Hostel Expense Management - Deployment Setup Script
# This script helps you set up your CI/CD pipeline for Vercel and Render

function Show-Header {
    Clear-Host
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host "🏨 Hostel Expense Management - Deployment Setup" -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Menu {
    Show-Header
    Write-Host "Available Options:" -ForegroundColor Yellow
    Write-Host "1. Setup GitHub Secrets"
    Write-Host "2. Setup Vercel Configuration"
    Write-Host "3. Setup Render Configuration"
    Write-Host "4. Test Local Deployment"
    Write-Host "5. Full Setup Guide"
    Write-Host "6. Exit"
    Write-Host ""
    
    $choice = Read-Host "Enter your choice (1-6)"
    
    switch ($choice) {
        "1" { Show-GitHubSecretsSetup }
        "2" { Show-VercelSetup }
        "3" { Show-RenderSetup }
        "4" { Test-LocalDeployment }
        "5" { Show-FullSetupGuide }
        "6" { exit }
        default { 
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
            Start-Sleep -Seconds 2
            Show-Menu 
        }
    }
}

function Show-GitHubSecretsSetup {
    Show-Header
    Write-Host "🔐 GitHub Secrets Setup" -ForegroundColor Yellow
    Write-Host "========================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You'll need to add these secrets to your GitHub repository:"
    Write-Host ""
    Write-Host "📱 Frontend (Vercel):" -ForegroundColor Green
    Write-Host "   - VERCEL_TOKEN: Your Vercel API token"
    Write-Host "   - VERCEL_ORG_ID: Your Vercel organization ID"
    Write-Host "   - VERCEL_PROJECT_ID: Your Vercel project ID"
    Write-Host ""
    Write-Host "🔧 Backend (Render):" -ForegroundColor Blue
    Write-Host "   - RENDER_API_KEY: Your Render API key"
    Write-Host "   - RENDER_SERVICE_ID: Your Render service ID"
    Write-Host ""
    Write-Host "📝 To add these secrets:"
    Write-Host "   1. Go to your GitHub repository"
    Write-Host "   2. Click Settings → Secrets and variables → Actions"
    Write-Host "   3. Click 'New repository secret'"
    Write-Host "   4. Add each secret with its corresponding value"
    Write-Host ""
    Pause
    Show-Menu
}

function Show-VercelSetup {
    Show-Header
    Write-Host "🚀 Vercel Setup" -ForegroundColor Yellow
    Write-Host "================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Vercel Configuration Steps:"
    Write-Host ""
    Write-Host "1. Create Vercel Account:"
    Write-Host "   - Visit https://vercel.com and sign up"
    Write-Host "   - Connect your GitHub account"
    Write-Host ""
    Write-Host "2. Create New Project:"
    Write-Host "   - Click 'New Project'"
    Write-Host "   - Import your GitHub repository"
    Write-Host "   - Select the frontend folder"
    Write-Host ""
    Write-Host "3. Configure Build Settings:"
    Write-Host "   - Framework Preset: Vite"
    Write-Host "   - Build Command: npm run build"
    Write-Host "   - Output Directory: dist"
    Write-Host "   - Root Directory: frontend"
    Write-Host ""
    Write-Host "4. Set Environment Variables:"
    Write-Host "   - VITE_API_URL: Your backend API URL (e.g., https://your-app.onrender.com)"
    Write-Host "   - VITE_SOCKET_URL: Your WebSocket URL (optional)"
    Write-Host ""
    Write-Host "5. Get API Token:"
    Write-Host "   - Go to Settings → Tokens"
    Write-Host "   - Create a new token for GitHub Actions"
    Write-Host ""
    Write-Host "6. Get Project IDs:"
    Write-Host "   - Project settings will show your ORG_ID and PROJECT_ID"
    Write-Host ""
    Pause
    Show-Menu
}

function Show-RenderSetup {
    Show-Header
    Write-Host "⚙️ Render Setup" -ForegroundColor Yellow
    Write-Host "=================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Render Configuration Steps:"
    Write-Host ""
    Write-Host "1. Create Render Account:"
    Write-Host "   - Visit https://render.com and sign up"
    Write-Host "   - Connect your GitHub account"
    Write-Host ""
    Write-Host "2. Create Web Service:"
    Write-Host "   - Click 'New → Web Service'"
    Write-Host "   - Connect your GitHub repository"
    Write-Host "   - Select the backend folder"
    Write-Host ""
    Write-Host "3. Configure Build Settings:"
    Write-Host "   - Build Command: npm install && npx prisma generate && npm run build"
    Write-Host "   - Start Command: npm run start"
    Write-Host "   - Environment: Node"
    Write-Host "   - Node Version: 18"
    Write-Host ""
    Write-Host "4. Set Environment Variables:"
    Write-Host "   - NODE_ENV: production"
    Write-Host "   - PORT: 3001"
    Write-Host "   - DATABASE_URL: PostgreSQL connection string"
    Write-Host "   - JWT_SECRET: Generate a secure random string"
    Write-Host ""
    Write-Host "5. Create PostgreSQL Database:"
    Write-Host "   - Click 'New → PostgreSQL'"
    Write-Host "   - Choose appropriate plan (start with free tier)"
    Write-Host "   - Copy the connection string to DATABASE_URL"
    Write-Host ""
    Write-Host "6. Get API Key:"
    Write-Host "   - Go to Account Settings → API Keys"
    Write-Host "   - Create a new API key for GitHub Actions"
    Write-Host ""
    Write-Host "7. Get Service ID:"
    Write-Host "   - Service settings will show your SERVICE_ID"
    Write-Host "   - Or use the service name in the URL"
    Write-Host ""
    Pause
    Show-Menu
}

function Test-LocalDeployment {
    Show-Header
    Write-Host "🧪 Testing Local Deployment" -ForegroundColor Yellow
    Write-Host "============================" -ForegroundColor Yellow
    Write-Host ""
    
    # Test frontend build
    Write-Host "Testing Frontend Build..." -ForegroundColor Cyan
    try {
        Set-Location -Path "frontend"
        Write-Host "Installing dependencies..."
        npm install
        Write-Host "Building frontend..."
        npm run build
        Write-Host "✅ Frontend build successful!" -ForegroundColor Green
        
        # Check if dist folder exists
        if (Test-Path "dist") {
            Write-Host "✅ Build output found in dist/ folder" -ForegroundColor Green
        } else {
            Write-Host "❌ Build output not found" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Frontend build failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    finally {
        Set-Location -Path ".."
    }
    
    Write-Host ""
    
    # Test backend build
    Write-Host "Testing Backend Build..." -ForegroundColor Cyan
    try {
        Set-Location -Path "backend"
        Write-Host "Installing dependencies..."
        npm install
        Write-Host "Generating Prisma client..."
        npx prisma generate
        Write-Host "Building backend..."
        npm run build
        Write-Host "✅ Backend build successful!" -ForegroundColor Green
        
        # Check if dist folder exists
        if (Test-Path "dist") {
            Write-Host "✅ Build output found in dist/ folder" -ForegroundColor Green
        } else {
            Write-Host "❌ Build output not found" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Backend build failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    finally {
        Set-Location -Path ".."
    }
    
    Write-Host ""
    Pause
    Show-Menu
}

function Show-FullSetupGuide {
    Show-Header
    Write-Host "📚 Complete Setup Guide" -ForegroundColor Yellow
    Write-Host "=======================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This guide will walk you through the complete deployment setup."
    Write-Host ""
    Write-Host "Step 1: Local Testing" -ForegroundColor Green
    Write-Host "   - Run option 4 to test local builds"
    Write-Host "   - Fix any build issues before proceeding"
    Write-Host ""
    Write-Host "Step 2: Platform Setup" -ForegroundColor Green
    Write-Host "   - Complete Vercel setup (option 2)"
    Write-Host "   - Complete Render setup (option 3)"
    Write-Host ""
    Write-Host "Step 3: GitHub Secrets" -ForegroundColor Green
    Write-Host "   - Add all required secrets (option 1)"
    Write-Host "   - Verify secrets are correctly set"
    Write-Host ""
    Write-Host "Step 4: Deploy" -ForegroundColor Green
    Write-Host "   - Push your code to the main branch"
    Write-Host "   - Monitor GitHub Actions for deployment status"
    Write-Host "   - Check deployment logs in Vercel and Render dashboards"
    Write-Host ""
    Write-Host "Step 5: Verify" -ForegroundColor Green
    Write-Host "   - Test your deployed frontend"
    Write-Host "   - Test your deployed backend API"
    Write-Host "   - Verify database connectivity"
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Red
    Write-Host "   - Check GitHub Actions logs for errors"
    Write-Host "   - Verify environment variables in both platforms"
    Write-Host "   - Ensure all secrets are correctly set"
    Write-Host "   - Test local builds work correctly"
    Write-Host ""
    Pause
    Show-Menu
}

# Start the script
Show-Menu