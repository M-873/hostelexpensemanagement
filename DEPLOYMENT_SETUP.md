# 🚀 Deployment Setup Guide

## Prerequisites

1. **GitHub Account** with repository access
2. **Vercel Account** for frontend deployment
3. **Render Account** for backend deployment
4. **GitHub Personal Access Tokens** with repo permissions

## 🔧 Step-by-Step Deployment Setup

### 1. Create Missing Frontend Repository

Since `M-873/hostelexpensemanagement1` doesn't exist, you need to create it:

```bash
# Create new repository on GitHub named 'hostelexpensemanagement1'
# Then clone and setup:
git clone https://github.com/M-873/hostelexpensemanagement1.git
cd hostelexpensemanagement1
git init
```

### 2. Configure GitHub Secrets

Add these secrets to your main repository (`hostelexpensemanagement`):

- `BACKEND_DEPLOY_TOKEN`: GitHub personal access token with repo permissions
- `FRONTEND_DEPLOY_TOKEN`: GitHub personal access token with repo permissions

### 3. Backend Deployment (Render)

**Environment Variables to set in Render Dashboard:**
```
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://hostelexpensemanagement1.vercel.app
PORT=3001
RENDER_API_KEY=rnd_9YIP45FPmGSo0aObD9Sug8lohnP6
```

### 4. Frontend Deployment (Vercel)

**Status**: ✅ Frontend built and ready for deployment

**Environment Variables to set in Vercel Dashboard:**
```
VITE_API_BASE_URL=https://hostelexpensemanagement.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_ENV=production
```

**Deployment Options:**
1. **Vercel Dashboard** (Recommended): Drag and drop the `dist` folder
2. **Vercel CLI**: `npx vercel --prod` (requires authentication)
3. **Alternative**: Use Netlify, GitHub Pages, or other static hosting

**Files Ready for Deployment:**
- `dist/index.html` - Main application
- `dist/assets/` - CSS, JS, and images
- `vercel.json` - Deployment configuration
- `DEPLOYMENT_INSTRUCTIONS.md` - Step-by-step guide

### 5. Database Setup

1. Create PostgreSQL database on Render
2. Update `DATABASE_URL` in Render environment variables
3. Run database migrations

### 6. Google Authentication Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized origins:
   - `https://hostelexpensemanagement1.vercel.app`
   - `http://localhost:8080` (for development)
4. Update `GOOGLE_CLIENT_ID` in both frontend and backend

## 🔗 Final URLs After Deployment

- **Frontend**: `https://hostelexpensemanagement1.vercel.app`
- **Backend**: `https://hostelexpensemanagement.onrender.com`
- **Backend API**: `https://hostelexpensemanagement.onrender.com/api`
- **Render Dashboard**: `https://dashboard.render.com/web/srv-d5m7h063jp1c739tbp6g`

## ⚠️ Common Issues & Solutions

### 1. CORS Issues
Ensure backend has proper CORS configuration for the frontend URL.

### 2. Environment Variables
Double-check all environment variables are set correctly in both platforms.

### 3. Build Failures
Check build logs on both Vercel and Render dashboards for specific errors.

### 4. Database Connection
Ensure PostgreSQL database is properly configured and accessible.

## 📝 Next Steps

1. Create the missing frontend repository
2. Set up GitHub secrets
3. Configure environment variables
4. Test deployments
5. Monitor logs for any issues