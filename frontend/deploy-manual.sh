# Simple Vercel Deployment Script
# This creates a deployment using the Vercel API

# First, let me create a simple static deployment configuration
# Since we have a built dist folder, we'll deploy it as static files

# Create a simple vercel.json for static deployment
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    },
    {
      "src": "/",
      "dest": "/dist/index.html"
    }
  ]
}
EOF

echo "🚀 Ready to deploy frontend to Vercel..."
echo "📁 Build files location: dist/"
echo ""
echo "To deploy manually:"
echo "1. Go to https://vercel.com"
echo "2. Click 'New Project'"
echo "3. Import your repository or drag and drop the dist folder"
echo "4. Configure environment variables:"
echo "   - VITE_API_BASE_URL=https://hostelexpensemanagement.onrender.com/api"
echo "   - VITE_GOOGLE_CLIENT_ID=your-google-client-id"
echo "   - VITE_ENV=production"
echo ""
echo "Or use: npx vercel --prod (after authentication)"