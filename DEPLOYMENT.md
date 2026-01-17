# Hostel Expense Management - Deployment Guide

## 🚀 CI/CD Pipeline Overview

This project uses a comprehensive CI/CD pipeline that automatically deploys:
- **Frontend** (React + Vite) → **Vercel**
- **Backend** (Node.js + Express + Prisma) → **Render**

## 📁 Project Structure

```
hostel-expense-management/
├── frontend/                 # React + Vite application
│   ├── src/
│   ├── dist/                 # Build output (for Vercel)
│   ├── vercel.json          # Vercel configuration
│   └── package.json
├── backend/                  # Node.js + Express + Prisma
│   ├── src/
│   ├── dist/                 # Build output (for Render)
│   ├── prisma/               # Database schema
│   ├── render.yaml          # Render configuration
│   └── package.json
├── .github/
│   └── workflows/           # GitHub Actions workflows
│       ├── ci-cd.yml        # Main CI/CD pipeline
│       ├── deploy-frontend.yml
│       └── deploy-backend.yml
└── scripts/
    └── setup-deployment.sh  # Setup helper script
```

## 🔧 Deployment Configuration

### Frontend (Vercel)

**Build Settings:**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables:**
```bash
VITE_API_URL=https://your-backend-url.onrender.com
VITE_SOCKET_URL=wss://your-backend-url.onrender.com
```

**Files:**
- `frontend/vercel.json` - Vercel configuration
- `.github/workflows/deploy-frontend.yml` - Deployment workflow

### Backend (Render)

**Build Settings:**
- Environment: Node.js
- Build Command: `npm install && npx prisma generate && npm run build`
- Start Command: `npm run start`
- Root Directory: `backend`

**Environment Variables:**
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-jwt-secret-key
```

**Files:**
- `backend/render.yaml` - Render configuration
- `.github/workflows/deploy-backend.yml` - Deployment workflow

## 🔐 Required GitHub Secrets

Add these secrets to your GitHub repository at:
`Settings → Secrets and variables → Actions`

### For Vercel (Frontend):
```bash
VERCEL_TOKEN=your_vercel_api_token
VERCEL_ORG_ID=your_vercel_organization_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### For Render (Backend):
```bash
RENDER_API_KEY=your_render_api_key
RENDER_SERVICE_ID=your_render_service_id
```

### Optional Environment Variables:
```bash
VITE_API_URL=your_backend_api_url
VITE_SOCKET_URL=your_websocket_url
```

## 🚀 How to Set Up

### 1. Set up Vercel (Frontend)

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables in Vercel dashboard
6. Deploy and get your project ID and org ID

### 2. Set up Render (Backend)

1. Go to [Render](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Environment**: Node
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start`
5. Add PostgreSQL database
6. Add environment variables in Render dashboard
7. Deploy and get your service ID

### 3. Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to `Settings → Secrets and variables → Actions`
3. Add all the required secrets listed above
4. Use the setup script for guidance:
   ```bash
   chmod +x scripts/setup-deployment.sh
   ./scripts/setup-deployment.sh
   ```

## 🔄 Deployment Triggers

### Automatic Deployment (on push to main):
- **Frontend changes** in `frontend/` → Triggers Vercel deployment
- **Backend changes** in `backend/` → Triggers Render deployment
- **Workflow changes** → Triggers respective deployment

### Manual Deployment:
- Go to GitHub Actions tab
- Select the workflow
- Click "Run workflow" → Choose environment

## 📊 Deployment Pipeline

### 1. CI/CD Pipeline (`ci-cd.yml`)
- Runs on every push to main/develop
- Tests both frontend and backend
- Deploys to production (main branch only)
- Provides deployment summary

### 2. Frontend Deployment (`deploy-frontend.yml`)
- Triggered by frontend changes
- Runs tests and linting
- Builds the application
- Deploys to Vercel
- Performs health check

### 3. Backend Deployment (`deploy-backend.yml`)
- Triggered by backend changes
- Runs tests and linting
- Generates Prisma client
- Builds the application
- Deploys to Render
- Waits for deployment completion

## 🧪 Testing Deployment Locally

### Frontend:
```bash
cd frontend
npm install
npm run build
npm run preview  # Test the built application
```

### Backend:
```bash
cd backend
npm install
npx prisma generate
npm run build
npm run start    # Test the built application
```

## 🔍 Monitoring and Debugging

### GitHub Actions:
- Check the Actions tab in your repository
- View logs for each workflow run
- Download artifacts if needed

### Vercel:
- Check [Vercel Dashboard](https://vercel.com/dashboard)
- View deployment logs
- Check environment variables
- Monitor performance

### Render:
- Check [Render Dashboard](https://dashboard.render.com)
- View service logs
- Check environment variables
- Monitor resource usage

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Deployment Failures:**
   - Verify all secrets are correctly set
   - Check environment variables
   - Review deployment logs

3. **API Connection Issues:**
   - Ensure CORS is properly configured
   - Verify API URLs in environment variables
   - Check network connectivity

### Getting Help:
- Check GitHub Actions logs
- Review deployment platform dashboards
- Test locally before deploying
- Use the setup script for guidance

## 📈 Performance Optimization

### Frontend:
- Enable Vercel's automatic optimizations
- Use proper caching headers
- Optimize images and assets
- Implement code splitting

### Backend:
- Use Render's auto-scaling features
- Optimize database queries
- Implement proper caching
- Monitor resource usage

## 🔒 Security Best Practices

1. **Never commit secrets** to your repository
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** on both platforms
4. **Set up proper CORS** configuration
5. **Use strong JWT secrets**
6. **Regularly update dependencies**

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**🎉 Your CI/CD pipeline is ready! Push to the main branch to trigger automatic deployment.**