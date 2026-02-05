"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const auth_1 = __importDefault(require("./routes/auth"));
const hostels_1 = __importDefault(require("./routes/hostels"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const deposits_1 = __importDefault(require("./routes/deposits"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const noticeBoard_1 = __importDefault(require("./routes/noticeBoard"));
const notes_1 = __importDefault(require("./routes/notes"));
const meals_1 = __importDefault(require("./routes/meals"));
const googleAuth_1 = __importDefault(require("./routes/googleAuth"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set('trust proxy', 1);
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
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
exports.io = io;
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });
    next();
});
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use('/api/auth/google', googleAuth_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/hostels', hostels_1.default);
app.use('/api/expenses', expenses_1.default);
app.use('/api/deposits', deposits_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/notices', noticeBoard_1.default);
app.use('/api/notes', notes_1.default);
app.use('/api/meals', meals_1.default);
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    next();
});
io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);
    socket.on('join-hostel', (hostelId) => {
        socket.join(`hostel-${hostelId}`);
        console.log(`🏠 User ${socket.id} joined hostel room: hostel-${hostelId}`);
    });
    socket.on('disconnect', () => {
        console.log('👋 User disconnected:', socket.id);
    });
});
app.set('io', io);
const PORT = process.env.PORT || 3001;
server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
    console.log('✅ Connected to database via Prisma');
    console.log('✅ Real-time updates enabled');
});
//# sourceMappingURL=server.js.map