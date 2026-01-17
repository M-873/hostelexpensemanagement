"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./routes/auth"));
const hostels_1 = __importDefault(require("./routes/hostels"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const deposits_1 = __importDefault(require("./routes/deposits"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const dataCleanup_1 = require("./services/dataCleanup");
const calculations_1 = require("./services/calculations");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:8080',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});
exports.io = io;
exports.prisma = new client_1.PrismaClient();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use('/api/auth', auth_1.default);
app.use('/api/hostels', hostels_1.default);
app.use('/api/expenses', expenses_1.default);
app.use('/api/deposits', deposits_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('join-hostel', (hostelId) => {
        socket.join(`hostel-${hostelId}`);
        console.log(`Client ${socket.id} joined hostel ${hostelId}`);
    });
    socket.on('leave-hostel', (hostelId) => {
        socket.leave(`hostel-${hostelId}`);
        console.log(`Client ${socket.id} left hostel ${hostelId}`);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
const cleanupInterval = process.env.CLEANUP_INTERVAL_HOURS || '24';
const dataRetentionDays = parseInt(process.env.DATA_RETENTION_DAYS || '90');
node_cron_1.default.schedule(`0 */${cleanupInterval} * * *`, async () => {
    console.log(`Running data cleanup for data older than ${dataRetentionDays} days...`);
    try {
        const deletedCount = await (0, dataCleanup_1.cleanupOldData)(dataRetentionDays);
        console.log(`Data cleanup completed. Deleted ${deletedCount} old records.`);
    }
    catch (error) {
        console.error('Data cleanup failed:', error);
    }
});
node_cron_1.default.schedule('0 0 * * *', async () => {
    console.log('Calculating daily totals for all hostels...');
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const hostels = await exports.prisma.hostel.findMany();
        for (const hostel of hostels) {
            await (0, calculations_1.calculateDailyTotals)(hostel.id, yesterday);
        }
        console.log('Daily totals calculation completed.');
    }
    catch (error) {
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
exports.default = app;
//# sourceMappingURL=server-original.js.map