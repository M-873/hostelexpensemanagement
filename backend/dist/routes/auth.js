"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma_1 = require("../prisma");
const prisma = prisma_1.prisma;
const router = express_1.default.Router();
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(['ADMIN', 'USER', 'MANAGER']),
});
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().min(2),
    role: zod_1.z.enum(['ADMIN', 'USER', 'MANAGER']).optional(),
    hostelId: zod_1.z.string().uuid().optional(),
});
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = loginSchema.parse(req.body);
        const user = await prisma.user.findUnique({
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
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (user.role !== role) {
            return res.status(401).json({ error: 'Invalid role' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, hostelId: user.hostelId }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
        return res.json(response);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role, hostelId } = registerSchema.parse(req.body);
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || 'USER',
                hostelId,
                isEmailVerified: true,
            },
        });
        const response = {
            token: jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, hostelId: user.hostelId }, process.env.JWT_SECRET, { expiresIn: '7d' }),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                hostelId: user.hostelId || undefined,
            },
        };
        return res.status(201).json(response);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Internal server error' });
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
        const user = await prisma.user.findUnique({
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
        return res.json({
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
router.put('/update-profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const { name } = zod_1.z.object({ name: zod_1.z.string().min(2) }).parse(req.body);
        const updatedUser = await prisma.user.update({
            where: { id: decoded.userId },
            data: { name },
        });
        return res.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                hostelId: updatedUser.hostelId,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        return res.status(403).json({ error: 'Invalid token or update failed' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map