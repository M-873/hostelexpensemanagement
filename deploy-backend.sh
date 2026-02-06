#!/bin/bash

# Render Deployment Script for Backend
# This script helps deploy the backend to Render

echo "🚀 Starting Backend Deployment to Render..."

# Check if Render CLI is installed
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI not found. Please install it first:"
    echo "   curl https://render.com/docs/install-render-cli.sh | sh"
    exit 1
fi

# Set up deployment variables
SERVICE_NAME="hostel-expense-management-backend"
REPO_URL="https://github.com/M-873/hostelexpensemanagement"
BRANCH="master"
BUILD_COMMAND="npm install && npm run build"
START_COMMAND="npm start"

# Create deployment configuration
cat > render-deploy-config.json << EOF
{
  "type": "web_service",
  "name": "$SERVICE_NAME",
  "env": "node",
  "buildCommand": "$BUILD_COMMAND",
  "startCommand": "$START_COMMAND",
  "branch": "$BRANCH",
  "envVars": [
    {
      "key": "NODE_ENV",
      "value": "production"
    },
    {
      "key": "PORT",
      "value": "3001"
    },
    {
      "key": "FRONTEND_URL",
      "value": "https://hostelexpensemanagement1.vercel.app"
    },
    {
      "key": "RENDER_API_KEY",
      "value": "rnd_9YIP45FPmGSo0aObD9Sug8lohnP6"
    }
  ]
}
EOF

echo "✅ Deployment configuration created"
echo "📋 Configuration:"
cat render-deploy-config.json

echo ""
echo "📝 Next Steps:"
echo "1. Go to https://dashboard.render.com"
echo "2. Click 'New' → 'Web Service'"
echo "3. Connect your GitHub repository: M-873/hostelexpensemanagement"
echo "4. Use the configuration above"
echo "5. Set remaining environment variables (DATABASE_URL, JWT_SECRET, etc.)"
echo "6. Deploy!"

echo ""
echo "🎯 After deployment, your backend will be available at:"
echo "   https://hostel-expense-management-backend.onrender.com"
echo "   API: https://hostel-expense-management-backend.onrender.com/api"

# Clean up
rm render-deploy-config.json