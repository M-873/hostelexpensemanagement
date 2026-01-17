#!/bin/bash

# Hostel Expense Management - Deployment Setup Script
# This script helps you set up your CI/CD pipeline for Vercel and Render

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function show_header() {
    clear
    echo -e "${CYAN}==============================================${NC}"
    echo -e "${CYAN}🏨 Hostel Expense Management - Deployment Setup${NC}"
    echo -e "${CYAN}==============================================${NC}"
    echo ""
}

function pause() {
    read -p "Press Enter to continue..."
}

function show_menu() {
    show_header
    echo -e "${YELLOW}Available Options:${NC}"
    echo "1. Setup GitHub Secrets"
    echo "2. Setup Vercel Configuration"
    echo "3. Setup Render Configuration"
    echo "4. Test Local Deployment"
    echo "5. Full Setup Guide"
    echo "6. Exit"
    echo ""
    
    read -p "Enter your choice (1-6): " choice
    
    case $choice in
        1) show_github_secrets_setup ;;
        2) show_vercel_setup ;;
        3) show_render_setup ;;
        4) test_local_deployment ;;
        5) show_full_setup_guide ;;
        6) exit ;;
        *) 
            echo -e "${RED}Invalid choice. Please try again.${NC}"
            sleep 2
            show_menu 
            ;;
    esac
}

function show_github_secrets_setup() {
    show_header
    echo -e "${YELLOW}🔐 GitHub Secrets Setup${NC}"
    echo -e "${YELLOW}========================${NC}"
    echo ""
    echo "You'll need to add these secrets to your GitHub repository:"
    echo ""
    echo -e "${GREEN}📱 Frontend (Vercel):${NC}"
    echo "   - VERCEL_TOKEN: Your Vercel API token"
    echo "   - VERCEL_ORG_ID: Your Vercel organization ID"
    echo "   - VERCEL_PROJECT_ID: Your Vercel project ID"
    echo ""
    echo -e "${BLUE}🔧 Backend (Render):${NC}"
    echo "   - RENDER_API_KEY: Your Render API key"
    echo "   - RENDER_SERVICE_ID: Your Render service ID"
    echo ""
    echo "📝 To add these secrets:"
    echo "   1. Go to your GitHub repository"
    echo "   2. Click Settings → Secrets and variables → Actions"
    echo "   3. Click 'New repository secret'"
    echo "   4. Add each secret with its corresponding value"
    echo ""
    pause
    show_menu
}

function show_vercel_setup() {
    show_header
    echo -e "${YELLOW}🚀 Vercel Setup${NC}"
    echo -e "${YELLOW}================${NC}"
    echo ""
    echo "📋 Vercel Configuration Steps:"
    echo ""
    echo "1. Create Vercel Account:"
    echo "   - Visit https://vercel.com and sign up"
    echo "   - Connect your GitHub account"
    echo ""
    echo "2. Create New Project:"
    echo "   - Click 'New Project'"
    echo "   - Import your GitHub repository"
    echo "   - Select the frontend folder"
    echo ""
    echo "3. Configure Build Settings:"
    echo "   - Framework Preset: Vite"
    echo "   - Build Command: npm run build"
    echo "   - Output Directory: dist"
    echo "   - Root Directory: frontend"
    echo ""
    echo "4. Set Environment Variables:"
    echo "   - VITE_API_URL: Your backend API URL (e.g., https://your-app.onrender.com)"
    echo "   - VITE_SOCKET_URL: Your WebSocket URL (optional)"
    echo ""
    echo "5. Get API Token:"
    echo "   - Go to Settings → Tokens"
    echo "   - Create a new token for GitHub Actions"
    echo ""
    echo "6. Get Project IDs:"
    echo "   - Project settings will show your ORG_ID and PROJECT_ID"
    echo ""
    pause
    show_menu
}

function show_render_setup() {
    show_header
    echo -e "${YELLOW}⚙️ Render Setup${NC}"
    echo -e "${YELLOW}=================${NC}"
    echo ""
    echo "📋 Render Configuration Steps:"
    echo ""
    echo "1. Create Render Account:"
    echo "   - Visit https://render.com and sign up"
    echo "   - Connect your GitHub account"
    echo ""
    echo "2. Create Web Service:"
    echo "   - Click 'New → Web Service'"
    echo "   - Connect your GitHub repository"
    echo "   - Select the backend folder"
    echo ""
    echo "3. Configure Build Settings:"
    echo "   - Build Command: npm install && npx prisma generate && npm run build"
    echo "   - Start Command: npm run start"
    echo "   - Environment: Node"
    echo "   - Node Version: 18"
    echo ""
    echo "4. Set Environment Variables:"
    echo "   - NODE_ENV: production"
    echo "   - PORT: 3001"
    echo "   - DATABASE_URL: PostgreSQL connection string"
    echo "   - JWT_SECRET: Generate a secure random string"
    echo ""
    echo "5. Create PostgreSQL Database:"
    echo "   - Click 'New → PostgreSQL'"
    echo "   - Choose appropriate plan (start with free tier)"
    echo "   - Copy the connection string to DATABASE_URL"
    echo ""
    echo "6. Get API Key:"
    echo "   - Go to Account Settings → API Keys"
    echo "   - Create a new API key for GitHub Actions"
    echo ""
    echo "7. Get Service ID:"
    echo "   - Service settings will show your SERVICE_ID"
    echo "   - Or use the service name in the URL"
    echo ""
    pause
    show_menu
}

function test_local_deployment() {
    show_header
    echo -e "${YELLOW}🧪 Testing Local Deployment${NC}"
    echo -e "${YELLOW}============================${NC}"
    echo ""
    
    # Test frontend build
    echo -e "${CYAN}Testing Frontend Build...${NC}"
    if cd frontend; then
        echo "Installing dependencies..."
        if npm install; then
            echo "Building frontend..."
            if npm run build; then
                echo -e "${GREEN}✅ Frontend build successful!${NC}"
                
                # Check if dist folder exists
                if [ -d "dist" ]; then
                    echo -e "${GREEN}✅ Build output found in dist/ folder${NC}"
                else
                    echo -e "${RED}❌ Build output not found${NC}"
                fi
            else
                echo -e "${RED}❌ Frontend build failed${NC}"
            fi
        else
            echo -e "${RED}❌ Frontend dependency installation failed${NC}"
        fi
        cd ..
    else
        echo -e "${RED}❌ Could not navigate to frontend directory${NC}"
    fi
    
    echo ""
    
    # Test backend build
    echo -e "${CYAN}Testing Backend Build...${NC}"
    if cd backend; then
        echo "Installing dependencies..."
        if npm install; then
            echo "Generating Prisma client..."
            if npx prisma generate; then
                echo "Building backend..."
                if npm run build; then
                    echo -e "${GREEN}✅ Backend build successful!${NC}"
                    
                    # Check if dist folder exists
                    if [ -d "dist" ]; then
                        echo -e "${GREEN}✅ Build output found in dist/ folder${NC}"
                    else
                        echo -e "${RED}❌ Build output not found${NC}"
                    fi
                else
                    echo -e "${RED}❌ Backend build failed${NC}"
                fi
            else
                echo -e "${RED}❌ Prisma client generation failed${NC}"
            fi
        else
            echo -e "${RED}❌ Backend dependency installation failed${NC}"
        fi
        cd ..
    else
        echo -e "${RED}❌ Could not navigate to backend directory${NC}"
    fi
    
    echo ""
    pause
    show_menu
}

function show_full_setup_guide() {
    show_header
    echo -e "${YELLOW}📚 Complete Setup Guide${NC}"
    echo -e "${YELLOW}=======================${NC}"
    echo ""
    echo "This guide will walk you through the complete deployment setup."
    echo ""
    echo -e "${GREEN}Step 1: Local Testing${NC}"
    echo "   - Run option 4 to test local builds"
    echo "   - Fix any build issues before proceeding"
    echo ""
    echo -e "${GREEN}Step 2: Platform Setup${NC}"
    echo "   - Complete Vercel setup (option 2)"
    echo "   - Complete Render setup (option 3)"
    echo ""
    echo -e "${GREEN}Step 3: GitHub Secrets${NC}"
    echo "   - Add all required secrets (option 1)"
    echo "   - Verify secrets are correctly set"
    echo ""
    echo -e "${GREEN}Step 4: Deploy${NC}"
    echo "   - Push your code to the main branch"
    echo "   - Monitor GitHub Actions for deployment status"
    echo "   - Check deployment logs in Vercel and Render dashboards"
    echo ""
    echo -e "${GREEN}Step 5: Verify${NC}"
    echo "   - Test your deployed frontend"
    echo "   - Test your deployed backend API"
    echo "   - Verify database connectivity"
    echo ""
    echo -e "${RED}Troubleshooting:${NC}"
    echo "   - Check GitHub Actions logs for errors"
    echo "   - Verify environment variables in both platforms"
    echo "   - Ensure all secrets are correctly set"
    echo "   - Test local builds work correctly"
    echo ""
    pause
    show_menu
}

# Start the script
show_menu