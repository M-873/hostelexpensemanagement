#!/bin/bash

# Vercel Frontend Deployment Script
# This script deploys the built frontend to Vercel

# Configuration
PROJECT_NAME="hostel-expense-management-frontend"
DIST_DIR="dist"

# Check if dist folder exists
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ Dist folder not found. Please build the frontend first."
    exit 1
fi

# Create a simple vercel.json for static deployment
cat > vercel.json << 'EOF'
{
  "version": 2,
  "public": true,
  "github": {
    "enabled": false
  }
}
EOF

# Deploy to Vercel
echo "🚀 Deploying frontend to Vercel..."
npx vercel deploy --prod --name="$PROJECT_NAME" --yes

if [ $? -eq 0 ]; then
    echo "✅ Frontend deployed successfully!"
else
    echo "❌ Frontend deployment failed!"
    exit 1
fi