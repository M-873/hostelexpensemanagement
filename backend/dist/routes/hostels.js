"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const server_1 = require("../server");
const server_2 = require("../server");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const createHostelSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    registrationNumber: zod_1.z.string().regex(/^\d{6}$/, 'Registration number must be exactly 6 digits'),
    address: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
});
const membershipRequestSchema = zod_1.z.object({
    hostelId: zod_1.z.string().uuid(),
    message: zod_1.z.string().optional(),
});
const respondMembershipSchema = zod_1.z.object({
    requestId: zod_1.z.string().uuid(),
    status: zod_1.z.enum(['approved', 'rejected']),
});
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), async (req, res) => {
    try {
        const { name, registrationNumber, address, phone, email } = createHostelSchema.parse(req.body);
        const existingHostel = await server_1.prisma.hostel.findUnique({
            where: { registrationNumber },
        });
        if (existingHostel) {
            return res.status(400).json({ error: 'Registration number already exists' });
        }
        const hostel = await server_1.prisma.hostel.create({
            data: {
                name,
                registrationNumber,
                address,
                phone,
                email,
            },
        });
        if (req.user) {
            await server_1.prisma.user.update({
                where: { id: req.user.id },
                data: { hostelId: hostel.id },
            });
        }
        res.status(201).json({
            message: 'Hostel created successfully',
            hostel: {
                id: hostel.id,
                name: hostel.name,
                registrationNumber: hostel.registrationNumber,
                address: hostel.address,
                phone: hostel.phone,
                email: hostel.email,
                createdAt: hostel.createdAt,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Create hostel error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/search/:registrationNumber', auth_1.authenticateToken, async (req, res) => {
    try {
        const { registrationNumber } = zod_1.z.object({
            registrationNumber: zod_1.z.string().min(1),
        }).parse(req.params);
        const hostels = await server_1.prisma.hostel.findMany({
            where: {
                registrationNumber: {
                    contains: registrationNumber,
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
                name: true,
                registrationNumber: true,
                address: true,
                phone: true,
                email: true,
                createdAt: true,
            },
            take: 10,
        });
        res.json({ hostels });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Search hostels error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), async (req, res) => {
    try {
        const hostels = await server_1.prisma.hostel.findMany({
            select: {
                id: true,
                name: true,
                registrationNumber: true,
                address: true,
                phone: true,
                email: true,
                createdAt: true,
                _count: {
                    select: {
                        users: true,
                        expenses: true,
                        deposits: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json({ hostels });
    }
    catch (error) {
        console.error('Get hostels error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', auth_1.authenticateToken, auth_1.requireHostelAccess, async (req, res) => {
    try {
        const { id } = zod_1.z.object({
            id: zod_1.z.string().uuid(),
        }).parse(req.params);
        const hostel = await server_1.prisma.hostel.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                registrationNumber: true,
                address: true,
                phone: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        users: true,
                        expenses: true,
                        deposits: true,
                    },
                },
            },
        });
        if (!hostel) {
            return res.status(404).json({ error: 'Hostel not found' });
        }
        res.json({ hostel });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Get hostel error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/membership-request', auth_1.authenticateToken, (0, auth_1.requireRole)(['user']), async (req, res) => {
    try {
        const { hostelId, message } = membershipRequestSchema.parse(req.body);
        if (req.user?.hostelId) {
            return res.status(400).json({ error: 'You are already a member of a hostel' });
        }
        const hostel = await server_1.prisma.hostel.findUnique({
            where: { id: hostelId },
        });
        if (!hostel) {
            return res.status(404).json({ error: 'Hostel not found' });
        }
        const userCount = await server_1.prisma.user.count({
            where: { hostelId },
        });
        if (userCount >= 100) {
            return res.status(400).json({ error: 'Hostel has reached maximum capacity of 100 members' });
        }
        const updatedUser = await server_1.prisma.user.update({
            where: { id: req.user.id },
            data: { hostelId },
        });
        server_2.io.to(`hostel-${hostelId}`).emit('member-joined', {
            userId: req.user.id,
            userName: req.user.name,
            message: message || 'New member joined',
            timestamp: new Date().toISOString(),
        });
        res.json({
            message: 'Membership request approved successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                hostelId: updatedUser.hostelId,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Membership request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id/members', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin', 'manager']), auth_1.requireHostelAccess, async (req, res) => {
    try {
        const { id } = zod_1.z.object({
            id: zod_1.z.string().uuid(),
        }).parse(req.params);
        const members = await server_1.prisma.user.findMany({
            where: { hostelId: id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json({ members });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Get members error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), auth_1.requireHostelAccess, async (req, res) => {
    try {
        const { id } = zod_1.z.object({
            id: zod_1.z.string().uuid(),
        }).parse(req.params);
        const { name, address, phone, email } = createHostelSchema.partial().parse(req.body);
        const hostel = await server_1.prisma.hostel.update({
            where: { id },
            data: {
                name,
                address,
                phone,
                email,
            },
            select: {
                id: true,
                name: true,
                registrationNumber: true,
                address: true,
                phone: true,
                email: true,
                updatedAt: true,
            },
        });
        res.json({
            message: 'Hostel updated successfully',
            hostel,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Update hostel error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), async (req, res) => {
    try {
        const { id } = zod_1.z.object({
            id: zod_1.z.string().uuid(),
        }).parse(req.params);
        const hostel = await server_1.prisma.hostel.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        users: true,
                        expenses: true,
                        deposits: true,
                    },
                },
            },
        });
        if (!hostel) {
            return res.status(404).json({ error: 'Hostel not found' });
        }
        if (hostel._count.users > 0 || hostel._count.expenses > 0 || hostel._count.deposits > 0) {
            return res.status(400).json({
                error: 'Cannot delete hostel with existing data',
                details: {
                    users: hostel._count.users,
                    expenses: hostel._count.expenses,
                    deposits: hostel._count.deposits,
                }
            });
        }
        await server_1.prisma.hostel.delete({
            where: { id },
        });
        res.json({ message: 'Hostel deleted successfully' });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Delete hostel error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=hostels.js.map