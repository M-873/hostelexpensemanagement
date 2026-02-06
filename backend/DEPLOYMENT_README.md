# Backend Deployment Package
# This directory contains the built backend ready for deployment

## Files Included:
- dist/ - Compiled JavaScript files
- package.json - Dependencies and scripts
- render.yaml - Render deployment configuration
- .env.production - Production environment variables

## Deployment Steps:
1. Upload this package to Render
2. Set environment variables in Render dashboard
3. Deploy

## Environment Variables Required:
- DATABASE_URL (PostgreSQL connection string)
- JWT_SECRET (Your JWT secret key)
- GOOGLE_CLIENT_ID (Google OAuth client ID)
- EMAIL_USER (Gmail/email for notifications)
- EMAIL_PASS (Email app password)

## API Endpoints:
- GET /api/health - Health check
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/dashboard - Dashboard data
- GET /api/expenses - Get expenses
- POST /api/expenses - Create expense
- GET /api/deposits - Get deposits
- POST /api/deposits - Create deposit
- GET /api/hostels - Get hostels
- GET /api/meals - Get meals
- GET /api/noticeboard - Get notices
- GET /api/notes - Get notes

## Production URLs:
- Backend: https://hostel-expense-management-backend.onrender.com
- API: https://hostel-expense-management-backend.onrender.com/api

## Support:
For deployment issues, check:
- Render deployment logs
- Environment variable configuration
- Database connection
- Build logs