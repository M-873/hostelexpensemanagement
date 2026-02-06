# Frontend Deployment Instructions

## Manual Vercel Deployment

Since we're experiencing authentication issues with the Vercel CLI, here's how to manually deploy your frontend:

### Option 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "New Project"**
3. **Import Git Repository**:
   - Use: `https://github.com/M-873/hostelexpensemanagement1`
   - Or drag and drop the `dist` folder directly
4. **Configure Project**:
   - Framework Preset: Vite
   - Build Command: (leave empty - already built)
   - Output Directory: `dist`
   - Install Command: (leave empty)

5. **Set Environment Variables**:
   ```
   VITE_API_BASE_URL=https://hostelexpensemanagement.onrender.com/api
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   VITE_ENV=production
   ```

6. **Deploy**

### Option 2: Vercel CLI (After Authentication)

```bash
# Login to Vercel
npx vercel login

# Deploy
npx vercel --prod
```

### Option 3: Alternative Static Hosting

If Vercel continues to have issues, you can use these alternatives:

#### Netlify
1. Go to https://netlify.com
2. Drag and drop the `dist` folder
3. Set environment variables in Site Settings

#### GitHub Pages
1. Push the `dist` folder to a `gh-pages` branch
2. Enable GitHub Pages in repository settings

### Current Status
- ✅ Frontend built successfully
- ✅ Build files ready in `dist/` folder
- ✅ Environment variables configured
- ⚠️ Awaiting Vercel authentication/deployment

### Build Verification
Your frontend build contains:
- `dist/index.html` - Main entry point
- `dist/assets/` - CSS, JS, and image files
- All files are production-ready

### Next Steps
1. Choose your preferred deployment method above
2. Set the environment variables
3. Deploy and test the application
4. Update the backend CORS settings if needed

### Post-Deployment
After successful deployment:
1. Update the backend CORS configuration
2. Test the API endpoints
3. Verify Google authentication works
4. Update the GitHub Actions workflow