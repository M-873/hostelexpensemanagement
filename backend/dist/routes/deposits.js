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
const calculations_1 = require("../services/calculations");
const router = express_1.default.Router();
const createDepositSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
    description: zod_1.z.string().min(1).max(200),
    category: zod_1.z.string().min(1).max(50),
    date: zod_1.z.string().datetime(),
    hostelId: zod_1.z.string().uuid(),
});
const updateDepositSchema = zod_1.z.object({
    amount: zod_1.z.number().positive().optional(),
    description: zod_1.z.string().min(1).max(200).optional(),
    category: zod_1.z.string().min(1).max(50).optional(),
    date: zod_1.z.string().datetime().optional(),
});
router.get('/', auth_1.authenticateToken, auth_1.requireHostelAccess, async (req, res) => {
    try {
        const { page = 1, limit = 20, category, startDate, endDate } = req.query;
        const hostelId = req.query.hostelId;
        const skip = (Number(page) - 1) * Number(limit);
        const where = { hostelId };
        if (category) {
            where.category = category;
        }
        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date.gte = new Date(startDate);
            }
            if (endDate) {
                where.date.lte = new Date(endDate);
            }
        }
        const [deposits, total] = await Promise.all([
            server_1.prisma.deposit.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            server_1.prisma.deposit.count({ where }),
        ]);
        res.json({
            deposits: deposits.map(deposit => ({
                ...deposit,
                amount: deposit.amount.toNumber(),
            })),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get deposits error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', auth_1.authenticateToken, auth_1.requireHostelAccess, async (req, res) => {
    try {
        const { amount, description, category, date, hostelId } = createDepositSchema.parse(req.body);
        const deposit = await server_1.prisma.deposit.create({
            data: {
                amount,
                description,
                category,
                date: new Date(date),
                hostelId,
                userId: req.user.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        await (0, calculations_1.calculateDailyTotals)(hostelId, new Date(date));
        const updateData = await (0, calculations_1.triggerRealTimeUpdate)(hostelId, 'deposit');
        server_2.io.to(`hostel-${hostelId}`).emit('deposit-created', {
            deposit: {
                ...deposit,
                amount: deposit.amount.toNumber(),
            },
            ...updateData,
        });
        res.status(201).json({
            message: 'Deposit created successfully',
            deposit: {
                ...deposit,
                amount: deposit.amount.toNumber(),
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Create deposit error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', auth_1.authenticateToken, auth_1.requireHostelAccess, async (req, res) => {
    try {
        const { id } = zod_1.z.object({ id: zod_1.z.string().uuid() }).parse(req.params);
        const hostelId = req.query.hostelId;
        const deposit = await server_1.prisma.deposit.findFirst({
            where: { id, hostelId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!deposit) {
            return res.status(404).json({ error: 'Deposit not found' });
        }
        res.json({
            deposit: {
                ...deposit,
                amount: deposit.amount.toNumber(),
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Get deposit error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id', auth_1.authenticateToken, auth_1.requireHostelAccess, async (req, res) => {
    try {
        const { id } = zod_1.z.object({ id: zod_1.z.string().uuid() }).parse(req.params);
        const { amount, description, category, date } = updateDepositSchema.parse(req.body);
        const hostelId = req.query.hostelId;
        const existingDeposit = await server_1.prisma.deposit.findFirst({
            where: { id, hostelId },
        });
        if (!existingDeposit) {
            return res.status(404).json({ error: 'Deposit not found' });
        }
        const deposit = await server_1.prisma.deposit.update({
            where: { id },
            data: {
                amount,
                description,
                category,
                date: date ? new Date(date) : undefined,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        await (0, calculations_1.calculateDailyTotals)(hostelId, existingDeposit.date);
        if (date && new Date(date).toDateString() !== existingDeposit.date.toDateString()) {
            await (0, calculations_1.calculateDailyTotals)(hostelId, new Date(date));
        }
        const updateData = await (0, calculations_1.triggerRealTimeUpdate)(hostelId, 'deposit');
        server_2.io.to(`hostel-${hostelId}`).emit('deposit-updated', {
            deposit: {
                ...deposit,
                amount: deposit.amount.toNumber(),
            },
            ...updateData,
        });
        res.json({
            message: 'Deposit updated successfully',
            deposit: {
                ...deposit,
                amount: deposit.amount.toNumber(),
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Update deposit error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', auth_1.authenticateToken, auth_1.requireHostelAccess, async (req, res) => {
    try {
        const { id } = zod_1.z.object({ id: zod_1.z.string().uuid() }).parse(req.params);
        const hostelId = req.query.hostelId;
        const existingDeposit = await server_1.prisma.deposit.findFirst({
            where: { id, hostelId },
        });
        if (!existingDeposit) {
            return res.status(404).json({ error: 'Deposit not found' });
        }
        await server_1.prisma.deposit.delete({
            where: { id },
        });
        await (0, calculations_1.calculateDailyTotals)(hostelId, existingDeposit.date);
        const updateData = await (0, calculations_1.triggerRealTimeUpdate)(hostelId, 'deposit');
        server_2.io.to(`hostel-${hostelId}`).emit('deposit-deleted', {
            depositId: id,
            ...updateData,
        });
        res.json({ message: 'Deposit deleted successfully' });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Delete deposit error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/categories', auth_1.authenticateToken, async (req, res) => {
    try {
        const hostelId = req.query.hostelId;
        if (!hostelId) {
            return res.status(400).json({ error: 'Hostel ID required' });
        }
        const categories = await server_1.prisma.deposit.findMany({
            where: { hostelId },
            select: {
                category: true,
            },
            distinct: ['category'],
        });
        res.json({
            categories: categories.map(c => c.category),
        });
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/summary/category', auth_1.authenticateToken, auth_1.requireHostelAccess, async (req, res) => {
    try {
        const hostelId = req.query.hostelId;
        const { startDate, endDate } = req.query;
        const where = { hostelId };
        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date.gte = new Date(startDate);
            }
            if (endDate) {
                where.date.lte = new Date(endDate);
            }
        }
        const summary = await server_1.prisma.deposit.groupBy({
            by: ['category'],
            where,
            _sum: {
                amount: true,
            },
            _count: {
                amount: true,
            },
        });
        res.json({
            summary: summary.map(item => ({
                category: item.category,
                totalAmount: item._sum.amount.toNumber(),
                count: item._count.amount,
            })),
        });
    }
    catch (error) {
        console.error('Get category summary error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=deposits.js.map