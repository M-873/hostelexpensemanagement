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
import mealRoutes from './routes/meals';
import googleAuthRoutes from './routes/googleAuth';
import { prisma } from './prisma';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:8080',
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL || 'http://localhost:8080',
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
// app.use(helmet()); // Temporarily disabled for debugging connectivity
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});
app.use(cors({
  origin: (origin, callback) => {
    // Basic reflecting origin for debugging
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notices', noticeBoardRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/meals', mealRoutes);

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

const PORT = process.env.PORT || 3001;

server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
  console.log('✅ Connected to database via Prisma');
  console.log('✅ Real-time updates enabled');
});

export { io };
