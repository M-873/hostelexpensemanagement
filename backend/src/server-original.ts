import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth';
import hostelRoutes from './routes/hostels';
import expenseRoutes from './routes/expenses';
import depositRoutes from './routes/deposits';
import dashboardRoutes from './routes/dashboard';
import { cleanupOldData } from './services/dataCleanup';
import { calculateDailyTotals } from './services/calculations';

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

export const prisma = new PrismaClient();

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
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-hostel', (hostelId: string) => {
    socket.join(`hostel-${hostelId}`);
    console.log(`Client ${socket.id} joined hostel ${hostelId}`);
  });
  
  socket.on('leave-hostel', (hostelId: string) => {
    socket.leave(`hostel-${hostelId}`);
    console.log(`Client ${socket.id} left hostel ${hostelId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io for use in routes
export { io };

// Scheduled tasks
const cleanupInterval = process.env.CLEANUP_INTERVAL_HOURS || '24';
const dataRetentionDays = parseInt(process.env.DATA_RETENTION_DAYS || '90');

// Run data cleanup every 24 hours (or configured interval)
cron.schedule(`0 */${cleanupInterval} * * *`, async () => {
  console.log(`Running data cleanup for data older than ${dataRetentionDays} days...`);
  try {
    const deletedCount = await cleanupOldData(dataRetentionDays);
    console.log(`Data cleanup completed. Deleted ${deletedCount} old records.`);
  } catch (error) {
    console.error('Data cleanup failed:', error);
  }
});

// Calculate daily totals at midnight every day
cron.schedule('0 0 * * *', async () => {
  console.log('Calculating daily totals for all hostels...');
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const hostels = await prisma.hostel.findMany();
    for (const hostel of hostels) {
      await calculateDailyTotals(hostel.id, yesterday);
    }
    console.log('Daily totals calculation completed.');
  } catch (error) {
    console.error('Daily totals calculation failed:', error);
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔄 Cleanup interval: ${cleanupInterval} hours`);
  console.log(`📅 Data retention: ${dataRetentionDays} days`);
});

export default app;