"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const server_1 = require("../server");
const otpService_1 = require("../services/otpService");
const router = express_1.default.Router();
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email().regex(/@gmail\.com$/, 'Must be a Gmail address'),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(['admin', 'user']),
});
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email().regex(/@gmail\.com$/, 'Must be a Gmail address'),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().min(2),
    role: zod_1.z.enum(['admin', 'user', 'manager']).optional(),
    hostelId: zod_1.z.string().uuid().optional(),
});
const otpRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email().regex(/@gmail\.com$/, 'Must be a Gmail address'),
});
const otpVerifySchema = zod_1.z.object({
    email: zod_1.z.string().email().regex(/@gmail\.com$/, 'Must be a Gmail address'),
    otp: zod_1.z.string().length(6, 'OTP must be 6 digits'),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().min(2),
    role: zod_1.z.enum(['admin', 'user', 'manager']).optional(),
    hostelId: zod_1.z.string().uuid().optional(),
});
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = loginSchema.parse(req.body);
        const user = await server_1.prisma.user.findUnique({
            where: { email },
            include: {
                hostel: {
                    select: {
                        id: true,
                        name: true,
                        registrationNumber: true,
                    },
                },
            },
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (!user.isEmailVerified) {
            return res.status(401).json({ error: 'Please verify your email before logging in' });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (user.role !== role) {
            return res.status(401).json({ error: 'Invalid role' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, hostelId: user.hostelId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        const response = {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                hostelId: user.hostelId || undefined,
            },
        };
        res.json(response);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/request-otp', async (req, res) => {
    try {
        const { email } = otpRequestSchema.parse(req.body);
        const existingUser = await server_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser && existingUser.isEmailVerified) {
            return res.status(400).json({ error: 'User already exists and is verified' });
        }
        const otp = (0, otpService_1.generateOTP)();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        if (existingUser) {
            await server_1.prisma.user.update({
                where: { email },
                data: { otp, otpExpiry },
            });
        }
        else {
            await server_1.prisma.user.create({
                data: {
                    email,
                    password: '',
                    name: '',
                    role: 'user',
                    hostelId: '00000000-0000-0000-0000-000000000000',
                    otp,
                    otpExpiry,
                    isEmailVerified: false,
                },
            });
        }
        await (0, otpService_1.sendOTP)(email, otp);
        res.json({ message: 'OTP sent successfully', email });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('OTP request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp, password, name, role, hostelId } = otpVerifySchema.parse(req.body);
        const user = await server_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        if (!user.otp || !user.otpExpiry) {
            return res.status(400).json({ error: 'No OTP found' });
        }
        if ((0, otpService_1.isOTPExpired)(user.otpExpiry)) {
            return res.status(400).json({ error: 'OTP expired' });
        }
        if (!(0, otpService_1.verifyOTP)(user.otp, otp)) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const updatedUser = await server_1.prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                name,
                role: role || 'user',
                hostelId,
                otp: null,
                otpExpiry: null,
                isEmailVerified: true,
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: updatedUser.id, role: updatedUser.role, hostelId: updatedUser.hostelId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        const response = {
            token,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                hostelId: updatedUser.hostelId || undefined,
            },
        };
        res.json(response);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('OTP verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role, hostelId } = registerSchema.parse(req.body);
        const existingUser = await server_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await server_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || 'user',
                hostelId,
            },
        });
        const response = {
            token: jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, hostelId: user.hostelId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                hostelId: user.hostelId || undefined,
            },
        };
        res.status(201).json(response);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await server_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                hostelId: true,
                hostel: {
                    select: {
                        id: true,
                        name: true,
                        registrationNumber: true,
                    },
                },
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            hostelId: user.hostelId,
            hostel: user.hostel,
        });
    }
    catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map