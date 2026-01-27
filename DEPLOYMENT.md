# 🚀 Deployment Guide - Hostel Expense Management

This guide explains how to deploy the Hostel Expense Management application using the CI/CD pipeline.

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account with access to all three repositories
- ✅ Vercel account (for frontend hosting)
- ✅ Render account (for backend hosting)
- ✅ PostgreSQL database (can be provisioned via Render)

## 🏗️ Project Structure

The project uses a **monorepo-to-separate-repos** deployment strategy:

```
Local Development (Monorepo):
└── Hostel-Expense-Management/
    ├── frontend/          # React + Vite application
    ├── backend/           # Node.js + Express + Prisma API
    └── .github/workflows/ # CI/CD automation

Deployment (Separate Repos):
├── hostelexpensemanagement1  → Deploys to Vercel (Frontend)
└── hostelexpensemanagement   → Deploys to Render (Backend)
```

**How it works**: GitHub Actions automatically syncs code from the monorepo to the deployment repositories when changes are pushed.

## 🔧 Setup Instructions

### Step 1: Configure GitHub Secrets

Add the following secrets to your monorepo repository at:
`Settings > Secrets and variables > Actions > New repository secret`

1. **FRONTEND_DEPLOY_TOKEN**
   - Personal Access Token with `repo` scope
   - Used to push code to `hostelexpensemanagement1`
   - [Create token here](https://github.com/settings/tokens/new)

2. **BACKEND_DEPLOY_TOKEN**
   - Personal Access Token with `repo` scope
   - Used to push code to `hostelexpensemanagement`
   - Can use the same token as above or create a separate one

### Step 2: Configure Vercel (Frontend)

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import `hostelexpensemanagement1` repository
   - Select `main` branch for production

2. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variables**
   - Go to: `Project Settings > Environment Variables`
   - Add variable:
     ```
     VITE_API_BASE_URL = https://your-backend-name.onrender.com/api
     ```
   - Replace `your-backend-name` with your actual Render service URL (from Step 3)

### Step 3: Configure Render (Backend)

1. **Create Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect `hostelexpensemanagement` repository
   - Select `main` branch

2. **Configure Service Settings**
   - Name: `hostel-expense-backend` (or your preference)
   - Runtime: `Node`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm run start`

3. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<your-postgresql-connection-string>
   JWT_SECRET=<generate-strong-secret-key>
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-project-name.vercel.app
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=<your-gmail-address>
   EMAIL_PASS=<your-gmail-app-password>
   DATA_RETENTION_DAYS=90
   CLEANUP_INTERVAL_HOURS=24
   ```

4. **Create PostgreSQL Database** (if needed)
   - In Render Dashboard: "New +" → "PostgreSQL"
   - After creation, copy the "Internal Database URL"
   - Use this as `DATABASE_URL` in your web service environment variables

### Step 4: Update Environment Variables with Deployment URLs

After both services are deployed:

1. **Update Vercel Environment Variable**
   - Get your Render backend URL (e.g., `https://hostel-expense-backend.onrender.com`)
   - In Vercel: Update `VITE_API_BASE_URL` to point to this URL
   - Redeploy frontend

2. **Update Render Environment Variable**
   - Get your Vercel frontend URL (e.g., `https://hostelexpensemanagement1.vercel.app`)
   - In Render: Update `FRONTEND_URL` to this URL
   - Redeploy backend

## 🔄 CI/CD Workflow

### Automated Deployments

The GitHub Actions workflows automatically handle deployments:

**Frontend Workflow** (`.github/workflows/deploy-frontend.yml`):
- **Triggers on**: Changes to `frontend/**` directory
- **Actions**: Syncs code to `hostelexpensemanagement1` repo
- **Result**: Vercel auto-deploys from the updated repo

**Backend Workflow** (`.github/workflows/deploy-backend.yml`):
- **Triggers on**: Changes to `backend/**` directory
- **Actions**: Syncs code to `hostelexpensemanagement` repo
- **Result**: Render auto-deploys from the updated repo

### Manual Deployment

To manually trigger a deployment:

1. Go to your monorepo on GitHub
2. Navigate to `Actions` tab
3. Select the workflow (`Deploy Frontend` or `Deploy Backend`)
4. Click "Run workflow" → Select `main` branch → "Run workflow"

## 🧪 Testing the Deployment

### 1. Health Check

Test backend is running:
```bash
curl https://your-backend-name.onrender.com/api/health
```

Expected response:
```json
{"status":"OK","timestamp":"2026-01-27T..."}
```

### 2. Frontend Connection

1. Visit your Vercel URL: `https://your-project-name.vercel.app`
2. Open browser DevTools (F12) → Console tab
3. Check for any CORS or API connection errors
4. Try logging in with test credentials

### 3. Full E2E Test

- Register a new account
- Create a hostel
- Add expenses and deposits
- Verify calculations are correct
- Test real-time updates (open in 2 browser tabs)

## 🐛 Troubleshooting

### CORS Errors

**Problem**: Frontend shows CORS errors in console

**Solution**:
1. Verify `FRONTEND_URL` in Render includes the correct Vercel URL
2. Check there are no trailing slashes
3. Redeploy backend after updating environment variable

### API Connection Failed

**Problem**: Frontend can't connect to backend

**Solution**:
1. Verify `VITE_API_BASE_URL` in Vercel is correct
2. Ensure backend URL includes `/api` suffix
3. Check backend is running: visit `https://your-backend.onrender.com/health`
4. Redeploy frontend after updating environment variable

### Database Connection Issues

**Problem**: Backend fails to start with database errors

**Solution**:
1. Verify `DATABASE_URL` is correctly set in Render
2. Run migrations: Add "npm run db:migrate" to build command
3. Check database is accessible from Render (not behind firewall)

### GitHub Actions Workflow Fails

**Problem**: Workflow fails with authentication error

**Solution**:
1. Verify `FRONTEND_DEPLOY_TOKEN` and `BACKEND_DEPLOY_TOKEN` secrets are set
2. Ensure tokens have `repo` scope
3. Check tokens haven't expired
4. Regenerate tokens if needed

### Render Free Tier Spin-Down

**Problem**: Backend slow on first request after inactivity

**Solution**:
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Consider upgrading to paid tier for production use

## 📊 Monitoring

### Vercel
- **Dashboard**: https://vercel.com/md-mahfuzul-islams-projects/frontend
- **Logs**: Available in dashboard under "Deployments" → Select deployment → "Logs"
- **Analytics**: Built-in analytics for page views and performance

### Render
- **Dashboard**: https://dashboard.render.com/web/srv-d5m7h063jp1c739tbp6g
- **Logs**: Available in dashboard, shows real-time server logs
- **Metrics**: CPU, memory, and request metrics available

## 🔒 Security Checklist

Before going to production:

- [ ] Change `JWT_SECRET` to a strong, random value
- [ ] Use environment-specific secrets (don't reuse dev secrets)
- [ ] Enable HTTPS only (both Vercel and Render provide this by default)
- [ ] Review CORS settings - specify exact origins, not wildcards
- [ ] Set up database backups in Render
- [ ] Enable Vercel password protection for staging deployments
- [ ] Review rate limiting settings in backend
- [ ] Set up error monitoring (e.g., Sentry)

## 📝 Development Workflow

### Making Changes

1. **Work locally** on the monorepo
2. **Test locally** with `npm run dev` in both frontend and backend
3. **Commit changes** to the monorepo
4. **Push to GitHub**
5. **GitHub Actions automatically**:
   - Detects which folder changed  
   - Syncs code to appropriate deployment repo
   - Triggers Vercel/Render deployment
6. **Monitor deployment** in respective dashboards

### Rollback

If a deployment breaks:

**Option 1: Revert via Git**
```bash
git revert <commit-hash>
git push origin main
```

**Option 2: Redeploy Previous Version**
- Vercel: Go to Deployments → Select working deployment → "Promote to Production"
- Render: Go to Deploys → Select working deployment → "Redeploy"

## 🆘 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review deployment logs in Vercel/Render dashboards
3. Check GitHub Actions workflow logs
4. Verify all environment variables are correctly set
5. Test API endpoints directly with curl/Postman

---

**🎉 Once deployed, your app will be live at:**
- **Frontend**: `https://your-project-name.vercel.app`
- **Backend API**: `https://your-backend-name.onrender.com/api`
