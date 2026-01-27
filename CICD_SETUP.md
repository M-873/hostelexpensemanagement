# 🚀 Quick Start - CI/CD Setup

## What Has Been Configured

✅ **Frontend Configuration**
- Created `.env` file with API base URL configuration
- Updated API service to use environment variables
- Created `.env.example` for reference

✅ **Backend Configuration**
- Updated CORS to support multiple origins (local + production)
- Enhanced `.env` with production URL placeholders

✅ **GitHub Actions Workflows**
- `deploy-frontend.yml` - Syncs frontend code to deployment repo
- `deploy-backend.yml` - Syncs backend code to deployment repo

✅ **Documentation**
- Complete deployment guide in `DEPLOYMENT.md`
- Troubleshooting section included

## ⚠️ Required Actions

Before the CI/CD pipeline works, you need to:

### 1. Set Up GitHub Secrets

Go to your monorepo repository settings:
`https://github.com/M-873/Hostel-Expense-Management/settings/secrets/actions`

Add these secrets:
- **FRONTEND_DEPLOY_TOKEN**: GitHub Personal Access Token with `repo` scope
- **BACKEND_DEPLOY_TOKEN**: GitHub Personal Access Token with `repo` scope

[Create tokens here](https://github.com/settings/tokens/new?scopes=repo&description=Hostel-Expense-CI/CD)

### 2. Get Deployment URLs

You mentioned your services are already deployed. Please find:

**Backend URL (Render)**:
- Login to: https://dashboard.render.com
- Navigate to your service
- Copy the service URL (e.g., `https://hostel-expense-backend-xyz.onrender.com`)

**Frontend URL (Vercel)**:
- Login to: https://vercel.com
- Navigate to your project
- Copy the production domain (e.g., `https://hostelexpensemanagement1.vercel.app`)

### 3. Update Environment Variables

**In Vercel Dashboard**:
1. Go to Project Settings → Environment Variables
2. Add: `VITE_API_BASE_URL` = `<your-render-backend-url>/api`
3. Redeploy

**In Render Dashboard**:
1. Go to Environment → Environment Variables
2. Add/Update: `FRONTEND_URL` = `<your-vercel-frontend-url>`
3. Redeploy

**Locally** (for development):
1. Update `frontend/.env`: 
   - For production testing: `VITE_API_BASE_URL=<your-render-url>/api`
   - For local dev: Keep as `http://localhost:3001/api`

2. Update `backend/.env`:
   - Uncomment and set: `FRONTEND_URL=<your-vercel-url>`

## 🧪 Testing the Pipeline

After setting up GitHub secrets:

```bash
# Make a small change to test
cd frontend
# Edit a comment in a file
git add .
git commit -m "test: trigger CI/CD pipeline"
git push origin main
```

Then check:
1. GitHub Actions tab - Workflow should start
2. Vercel Dashboard - New deployment should appear
3. Your live site - Changes should appear after deployment

## 📚 Full Documentation

For complete setup instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🆘 Need Help?

Common issues:

- **"Authentication failed"** in GitHub Actions
  → Check your deploy tokens are correctly set in repository secrets

- **CORS errors** in browser console
  → Verify FRONTEND_URL in Render matches your Vercel URL exactly

- **API connection failed**
  → Check VITE_API_BASE_URL in Vercel includes `/api` suffix

- **Workflow doesn't trigger**
  → Make sure changes are in `frontend/**` or `backend/**` directories
  → Check workflow files are in `.github/workflows/` directory

## 📋 Next Steps

1. ✅ Set up GitHub secrets (tokens)
2. ✅ Get your deployment URLs from Vercel and Render
3. ✅ Update environment variables in both platforms
4. ✅ Test the pipeline with a small change
5. ✅ Monitor deployments in respective dashboards

---

**Once configured, your CI/CD pipeline will:**
- Automatically detect changes to frontend or backend
- Sync code to the appropriate deployment repository
- Trigger automatic deployments on Vercel/Render
- Keep your deployments in sync with your monorepo
