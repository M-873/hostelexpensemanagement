# Hostel Expense Management System

A comprehensive full-stack application for managing hostel expenses, notices, and notes with real-time updates and multi-tenant support.

## 🚀 Features

### Core Functionality
- **Multi-tenant Hostel Management**: Support for multiple hostels with isolated data
- **Real-time Notice Board**: Instant notifications for hostel-wide announcements
- **Note Management**: Personal notes with categories and public/private toggling
- **Expense Tracking**: Track individual and shared expenses
- **Deposit Management**: Record and track deposits
- **Dashboard Analytics**: Visual insights with charts and summaries

### User Features
- **Authentication**: JWT-based authentication with role-based access
- **Real-time Updates**: Socket.IO integration for live data synchronization
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Category-based Organization**: Notes and expenses organized by categories
- **Priority-based Notices**: High, medium, and low priority notifications

### Administrative Features
- **Hostel Management**: Admin panel for hostel configuration
- **User Management**: Control panel for user roles and permissions
- **Data Cleanup**: Automated cleanup of old data (90+ days)
- **Export Functionality**: Export data to CSV format

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Socket.IO
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcryptjs
- **Real-time**: Socket.IO for live updates
- **Deployment**: Render (backend) + Vercel (frontend)

### Project Structure
```
hostel-expense-management/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── backend/                  # Express backend application
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Express middleware
│   │   └── types/          # TypeScript type definitions
│   ├── prisma/             # Database schema
│   └── package.json
├── .github/workflows/        # CI/CD pipeline configurations
├── render.yaml              # Render deployment configuration
├── vercel.json              # Vercel deployment configuration
└── package.json             # Root monorepo configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL database (local or cloud)
- Git for version control

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hostel-expense-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env` in the backend directory
   - Configure your database connection and JWT secret

4. **Set up the database**
   ```bash
   cd backend
   npm run db:generate
   npm run db:push
   ```

5. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```
   - Frontend: http://localhost:8080
   - Backend: http://localhost:3001

## 🌐 Deployment

### Backend Deployment (Render)

1. **Create Render account**: https://render.com
2. **Connect GitHub repository** to Render
3. **Create PostgreSQL database** on Render
4. **Deploy using render.yaml configuration**:
   - Backend web service
   - Database service
   - Cleanup worker service

5. **Configure environment variables**:
   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<render-database-url>
   JWT_SECRET=<generated-secret>
   FRONTEND_URL=<frontend-url>
   ```

### Frontend Deployment (Vercel)

1. **Create Vercel account**: https://vercel.com
2. **Connect GitHub repository** to Vercel
3. **Deploy using vercel.json configuration**:
   - Automatic builds on push to main branch
   - Environment variable linking to backend

4. **Configure environment variables**:
   ```env
   VITE_API_BASE_URL=<backend-url>
   ```

### CI/CD Pipeline

The project includes comprehensive GitHub Actions workflows:

- **Main CI/CD Pipeline** (`.github/workflows/ci-cd.yml`):
  - Runs tests and linting on PR/push
  - Deploys backend to Render on main branch
  - Deploys frontend to Vercel on main branch

- **Backend Deployment** (`.github/workflows/deploy-backend.yml`):
  - Triggered on backend file changes
  - Automated deployment to Render

- **Frontend Deployment** (`.github/workflows/deploy-frontend.yml`):
  - Triggered on frontend file changes
  - Automated deployment to Vercel

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/hostel_expense_db
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:8080
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001
```

### Database Schema

The application uses Prisma ORM with the following main entities:
- **User**: Authentication and profile information
- **Hostel**: Multi-tenant hostel management
- **Expense**: Individual expense tracking
- **Deposit**: Deposit management
- **NoticeBoard**: Real-time announcements
- **Note**: Personal notes with categories
- **DailyCalculation**: Daily expense calculations

## 📊 Data Cleanup

The application includes automated data cleanup functionality:

- **Daily Cleanup** (3 AM): Removes expenses, deposits, and calculations older than 90 days
- **Weekly Cleanup** (Sunday 2 AM): Deep cleanup of inactive notices and private notes older than 30 days
- **Manual Cleanup**: Available through API endpoints for administrators

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run lint
npm run build
```

### Frontend Testing
```bash
cd frontend
npm run lint
npm run build
```

### Full Application Testing
```bash
# From root directory
npm run lint
npm run build
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: Express rate limiting for API protection
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Zod schemas for request validation
- **Helmet.js**: Security headers protection

## 📱 Real-time Features

- **Notice Board**: Real-time notifications using Socket.IO
- **Expense Updates**: Live expense tracking across users
- **Hostel-wide Broadcasts**: Instant communication within hostels
- **Connection Management**: Robust socket connection handling

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Theme switching capability
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client-side form validation
- **Accessibility**: ARIA labels and keyboard navigation

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Set up environment variables
- [ ] Configure database connection
- [ ] Set up Render account and services
- [ ] Set up Vercel account and project
- [ ] Configure GitHub repository secrets
- [ ] Test build process locally
- [ ] Verify database migrations
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test real-time features

## 📞 Support

For issues and questions:
1. Check the GitHub issues
2. Review the deployment logs
3. Verify environment configuration
4. Test with mock data locally

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with modern web technologies
- Powered by M873 - [https://m-873.github.io/M873/](https://m-873.github.io/M873/)
- Special thanks to the open-source community