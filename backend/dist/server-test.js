"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const auth_1 = __importDefault(require("./routes/auth"));
const hostels_1 = __importDefault(require("./routes/hostels"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const deposits_1 = __importDefault(require("./routes/deposits"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const mockDatabase_1 = __importStar(require("./services/mockDatabase"));
exports.prisma = mockDatabase_1.default;
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
(0, mockDatabase_1.initializeMockData)();
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('📊 Mock database initialized with test data');
    console.log('✅ Real-time updates enabled');
    console.log('📝 Test users:');
    console.log('  - admin@hostel.com / password (Admin)');
    console.log('  - user@hostel.com / password (User)');
});
//# sourceMappingURL=server-test.js.map