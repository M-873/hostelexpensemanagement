# 🏠 Hostel Expense Management

A full-stack web application for managing hostel expenses with automated CI/CD deployment.

## 🚀 Features

- **Frontend**: Modern React + Vite application
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL with Prisma
- **Deployment**: Automated CI/CD to Vercel (frontend) and Render (backend)
- **Authentication**: JWT-based authentication
- **Expense Tracking**: Add, edit, delete and categorize expenses
- **Real-time Updates**: Live expense calculations and summaries

## 📁 Project Structure

```
hostel-expense-management/
├── frontend/          # React + Vite frontend application
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
├── backend/           # Node.js + Express + Prisma backend
│   ├── src/          # API routes and controllers
│   ├── prisma/       # Database schema and migrations
│   └── package.json  # Backend dependencies
├── scripts/          # Setup and deployment scripts
│   ├── setup-deployment.ps1  # Windows setup script
│   └── setup-deployment.sh   # Unix/Linux setup script
├── .github/          # GitHub Actions workflows
│   └── workflows/    # CI/CD pipeline definitions
└── DEPLOYMENT.md     # Detailed deployment guide
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: CSS Modules
- **State Management**: React Context
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Express Validator

### Deployment & DevOps
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **CI/CD**: GitHub Actions
- **Version Control**: Git

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/M-873/hostel-expense-management.git
   cd hostel-expense-management
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npx prisma generate
   npx prisma migrate dev
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📋 Available Scripts

### Frontend Scripts
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Scripts
```bash
cd backend
npm run dev      # Start development server with nodemon
npm run build    # Build TypeScript to JavaScript
npm run start    # Start production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
```

## 🔧 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/hostel_expenses
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
```

## 🚀 Deployment

This project includes automated CI/CD deployment:

### Frontend (Vercel)
- Automatic deployment on push to `main` branch
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables managed in Vercel dashboard

### Backend (Render)
- Automatic deployment on push to `main` branch
- Build command: `npm install && npx prisma generate && npm run build`
- Start command: `npm run start`
- Environment variables managed in Render dashboard

### CI/CD Pipeline
- **Folder-based triggers**: Only deploy changed services
- **Frontend changes**: Trigger Vercel deployment
- **Backend changes**: Trigger Render deployment
- **Both changed**: Deploy both services

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Backend Testing
```bash
cd backend
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Expense Endpoints
- `GET /api/expenses` - Get all expenses for user
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Category Endpoints
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [troubleshooting guide](DEPLOYMENT.md#troubleshooting)
2. Review the [GitHub Issues](https://github.com/M-873/hostel-expense-management/issues)
3. Create a new issue with detailed information

## 🎉 Acknowledgments

- Built with modern web technologies
- Deployed on reliable cloud platforms
- Automated with GitHub Actions
- Designed for scalability and maintainability

---

**Made with ❤️ by Md Mahfuzul Islam**