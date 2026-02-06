# Deployment Instructions for Render

## Backend Deployment Steps:

1. **Create a new Web Service on Render:**
   - Go to https://dashboard.render.com
   - Click "New" → "Web Service"
   - Connect your GitHub repository: `M-873/hostelexpensemanagement`

2. **Configure the Backend Service:**
   - **Name**: `hostel-expense-management-backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid based on your needs)

3. **Set Environment Variables in Render Dashboard:**
```env
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://hostelexpensemanagement1.vercel.app
PORT=3001
RENDER_API_KEY=rnd_9YIP45FPmGSo0aObD9Sug8lohnP6
GOOGLE_CLIENT_ID=your_google_client_id
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

4. **Database Setup:**
   - Create a PostgreSQL database on Render
   - Copy the connection string to DATABASE_URL
   - The backend will auto-migrate on startup

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Check logs for any issues

## Frontend Deployment Steps (Vercel):

1. **Create Vercel Project:**
   - Go to https://vercel.com
   - Import from GitHub: `M-873/hostelexpensemanagement1`
   - (Create this repository first if it doesn't exist)

2. **Configure Build Settings:**
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Set Environment Variables in Vercel:**
```env
VITE_API_BASE_URL=https://hostelexpensemanagement.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_ENV=production
```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build and deployment

## Verification Steps:

1. **Test Backend API:**
   ```bash
   curl https://hostelexpensemanagement.onrender.com/api/health
   ```

2. **Test Frontend:**
   - Visit: https://hostelexpensemanagement1.vercel.app
   - Check if it loads and connects to backend

3. **Test Authentication:**
   - Try registering/logging in
   - Check if data persists

## Troubleshooting:

### Common Issues:
1. **CORS Errors**: Ensure FRONTEND_URL is set correctly in backend
2. **Database Connection**: Check DATABASE_URL format
3. **Build Failures**: Check package.json scripts and dependencies
4. **Environment Variables**: Double-check all variables are set

### Logs to Check:
- Render deployment logs
- Vercel build logs
- Browser console for frontend errors
- Network tab for API calls

## Current Status:
✅ Backend built successfully
✅ Production configuration files created
✅ Deployment scripts prepared
⏳ Ready for deployment to Render
⏳ Ready for deployment to Vercel