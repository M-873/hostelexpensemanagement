# 🔧 Platform Configuration Guide

This guide shows you exactly how to configure environment variables in Vercel and Render with your actual deployment URLs.

## Your Deployment URLs

- **Backend (Render)**: `https://hostel-expense-management.onrender.com`
- **Frontend (Vercel)**: `https://frontend-inky-one-43.vercel.app`

---

## 1️⃣ Configure Vercel (Frontend)

### Step 1: Access Environment Variables

1. Go to your Vercel dashboard: https://vercel.com/md-mahfuzul-islams-projects/frontend
2. Click on **Settings** tab
3. Click on **Environment Variables** in the left sidebar

### Step 2: Add Environment Variable

Click **Add New** and enter:

| Field | Value |
|-------|-------|
| **Key** | `VITE_API_BASE_URL` |
| **Value** | `https://hostel-expense-management.onrender.com/api` |
| **Environment** | ✅ Production, ✅ Preview, ✅ Development |

> **⚠️ CRITICAL**: Make sure to include `/api` at the end of the URL!

### Step 3: Redeploy

After adding the variable:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click the **•••** menu (three dots)
4. Select **Redeploy**
5. Confirm redeployment

**Expected result**: Frontend will now connect to your production backend API.

---

## 2️⃣ Configure Render (Backend)

### Step 1: Access Environment Variables

1. Go to your Render dashboard: https://dashboard.render.com/web/srv-d5m7h063jp1c739tbp6g
2. Click on **Environment** in the left sidebar
3. Scroll down to **Environment Variables** section

### Step 2: Check Existing Variables

Make sure you have these required variables set:

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=<your-postgresql-connection-string>
JWT_SECRET=<your-strong-secret-key>
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASS=<your-gmail-app-password>
DATA_RETENTION_DAYS=90
CLEANUP_INTERVAL_HOURS=24
```

### Step 3: Add/Update FRONTEND_URL

Look for `FRONTEND_URL` in your environment variables:

- **If it exists**: Click **Edit** and change the value to:
  ```
  https://frontend-inky-one-43.vercel.app
  ```

- **If it doesn't exist**: Click **Add Environment Variable**
  - **Key**: `FRONTEND_URL`
  - **Value**: `https://frontend-inky-one-43.vercel.app`

> **⚠️ IMPORTANT**: Do NOT include trailing slash!

### Step 4: Save and Deploy

1. Click **Save Changes**
2. Render will automatically redeploy your service
3. Wait for the deployment to complete (check the **Logs** tab)

**Expected result**: Backend will accept CORS requests from your frontend.

---

## 3️⃣ Set Up GitHub Secrets (for CI/CD)

### Step 1: Create Personal Access Token

1. Go to: https://github.com/settings/tokens/new
2. Configure the token:
   - **Note**: `Hostel Expense Management CI/CD`
   - **Expiration**: 90 days (or your preference)
   - **Scopes**: Check ✅ **repo** (Full control of private repositories)
3. Click **Generate token**
4. **IMPORTANT**: Copy the token immediately (you won't see it again)

### Step 2: Add Secrets to Repository

1. Go to your monorepo: https://github.com/M-873/Hostel-Expense-Management
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

Add two secrets:

**Secret 1:**
- **Name**: `FRONTEND_DEPLOY_TOKEN`
- **Value**: Paste your Personal Access Token
- Click **Add secret**

**Secret 2:**
- **Name**: `BACKEND_DEPLOY_TOKEN`  
- **Value**: Paste the same Personal Access Token (or create a new one)
- Click **Add secret**

---

## 4️⃣ Test the Configuration

### Test 1: Check Backend Health

Open your terminal and run:

```bash
curl https://hostel-expense-management.onrender.com/api/health
```

**Expected output:**
```json
{"status":"OK","timestamp":"2026-01-27T..."}
```

### Test 2: Check Frontend Connection

1. Open your frontend in a browser: https://frontend-inky-one-43.vercel.app
2. Open DevTools (F12)
3. Go to **Console** tab
4. Look for any errors (there should be NO CORS errors)
5. Go to **Network** tab
6. Try logging in or making an API call
7. Check that requests are going to: `https://hostel-expense-management.onrender.com/api/...`

### Test 3: Verify CORS

In the browser console, type:

```javascript
fetch('https://hostel-expense-management.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Expected**: Should log `{status: "OK", timestamp: "..."}`  
**If error**: CORS is not properly configured

---

## 5️⃣ Test CI/CD Pipeline

Once GitHub secrets are configured:

```bash
# Navigate to your project
cd "C:\Users\USER\OneDrive\Desktop\Hostel Expense Management"

# Make a small test change
echo "# CI/CD test" >> frontend/README.md

# Commit and push
git add .
git commit -m "test: trigger CI/CD pipeline"
git push origin master
```

Then check:
1. **GitHub Actions**: https://github.com/M-873/Hostel-Expense-Management/actions
   - Should see "Deploy Frontend to Vercel" workflow running
2. **Deployment Repo**: https://github.com/M-873/hostelexpensemanagement1
   - Should see new commit synced from monorepo
3. **Vercel Dashboard**: https://vercel.com/md-mahfuzul-islams-projects/frontend
   - Should see new deployment triggered

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Vercel has `VITE_API_BASE_URL` environment variable set
- [ ] Render has `FRONTEND_URL` environment variable set
- [ ] Both services have been redeployed after adding variables
- [ ] Backend health endpoint responds: `curl https://hostel-expense-management.onrender.com/api/health`
- [ ] Frontend loads without CORS errors
- [ ] GitHub secrets are configured (`FRONTEND_DEPLOY_TOKEN`, `BACKEND_DEPLOY_TOKEN`)
- [ ] Test commit triggers GitHub Actions workflow
- [ ] Frontend can successfully make API calls to backend

---

## 🐛 Troubleshooting

### Issue: CORS Error in Browser

**Symptoms**: Console shows "CORS policy blocked" error

**Solution**:
1. Verify `FRONTEND_URL` in Render is exactly: `https://frontend-inky-one-43.vercel.app` (no trailing slash)
2. Redeploy backend on Render
3. Wait 1-2 minutes for deployment to complete
4. Hard refresh frontend (Ctrl+Shift+R)

### Issue: API Calls Return 404

**Symptoms**: Network tab shows 404 for API requests

**Solution**:
1. Verify `VITE_API_BASE_URL` in Vercel ends with `/api`
2. Check backend is running: visit https://hostel-expense-management.onrender.com/health
3. Redeploy frontend on Vercel
4. Clear browser cache

### Issue: GitHub Actions Workflow Fails

**Symptoms**: Workflow shows red X with authentication error

**Solution**:
1. Verify both secrets are added in repository settings
2. Check token has `repo` scope
3. Regenerate token if expired
4. Update secret values in GitHub

### Issue: Render Free Tier Slow Response

**Symptoms**: First API call takes 30+ seconds

**Explanation**: Render free tier spins down after 15 minutes of inactivity. First request "wakes up" the service.

**Solutions**:
- Accept the delay (normal for free tier)
- Upgrade to paid tier for instant response
- Use a service like UptimeRobot to ping your backend every 10 minutes

---

## 📞 Next Steps

1. ✅ Configure Vercel environment variable
2. ✅ Configure Render environment variable  
3. ✅ Set up GitHub secrets
4. ✅ Test the connection
5. ✅ Make a test commit to trigger CI/CD

Once everything is configured, your full CI/CD pipeline will be active! 🎉

Any code changes pushed to `master` branch will automatically:
- Sync to the appropriate deployment repository
- Trigger automatic deployment on Vercel/Render
- Go live within minutes
