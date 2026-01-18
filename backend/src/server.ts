import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cron from 'node-cron';

import authRoutes from './routes/auth';
import hostelRoutes from './routes/hostels';
import expenseRoutes from './routes/expenses';
import depositRoutes from './routes/deposits';
import dashboardRoutes from './routes/dashboard';
import noticeBoardRoutes from './routes/noticeBoard';
import notesRoutes from './routes/notes';
import mockDatabase, { initializeMockData } from './services/mockDatabase';
import { dataCleanupService } from './services/dataCleanup';

// Make mockDatabase available globally for routes
export const prisma = mockDatabase;

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notices', noticeBoardRoutes);
app.use('/api/notes', notesRoutes);

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  // For testing, accept any token
  next();
});

// Socket.IO connection handling
io.on('connection', (socket: Socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join-hostel', (hostelId) => {
    socket.join(`hostel-${hostelId}`);
    console.log(`🏠 User ${socket.id} joined hostel room: hostel-${hostelId}`);
  });

  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Initialize mock data
initializeMockData();

// Initialize data cleanup service
dataCleanupService;

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('📊 Mock database initialized with test data');
  console.log('🧹 Data cleanup service initialized');
  console.log('✅ Real-time updates enabled');
  console.log('📝 Test users:');
  console.log('  - admin@hostel.com / password (Admin)');
  console.log('  - user@hostel.com / password (User)');
});

export { io };