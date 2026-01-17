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
const createExpenseSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
    description: zod_1.z.string().min(1).max(200),
    category: zod_1.z.string().min(1).max(50),
    date: zod_1.z.string().datetime(),
    hostelId: zod_1.z.string().uuid(),
});
const updateExpenseSchema = zod_1.z.object({
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
        const [expenses, total] = await Promise.all([
            server_1.prisma.expense.findMany({
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
            server_1.prisma.expense.count({ where }),
        ]);
        res.json({
            expenses: expenses.map(expense => ({
                ...expense,
                amount: expense.amount.toNumber(),
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
        console.error('Get expenses error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', auth_1.authenticateToken, auth_1.requireHostelAccess, async (req, res) => {
    try {
        const { amount, description, category, date, hostelId } = createExpenseSchema.parse(req.body);
        const expense = await server_1.prisma.expense.create({
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
        const updateData = await (0, calculations_1.triggerRealTimeUpdate)(hostelId, 'expense');
        server_2.io.to(`hostel-${hostelId}`).emit('expense-created', {
            expense: {
                ...expense,
                amount: expense.amount.toNumber(),
            },
            ...updateData,
        });
        res.status(201).json({
            message: 'Expense created successfully',
            expense: {
                ...expense,
                amount: expense.amount.toNumber(),
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Create expense error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', auth_1.authenticateToken, auth_1.requireHostelAccess, async (req, res) => {
    try {
        const { id } = zod_1.z.object({ id: zod_1.z.string().uuid() }).parse(req.params);
        const hostelId = req.query.hostelId;
        const expense = await server_1.prisma.expense.findFirst({
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
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({
            expense: {
                ...expense,
                amount: expense.amount.toNumber(),
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Get expense error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id', auth_1.authenticateToken, auth_1.requireHostelAccess, async (req, res) => {
    try {
        const { id } = zod_1.z.object({ id: zod_1.z.string().uuid() }).parse(req.params);
        const { amount, description, category, date } = updateExpenseSchema.parse(req.body);
        const hostelId = req.query.hostelId;
        const existingExpense = await server_1.prisma.expense.findFirst({
            where: { id, hostelId },
        });
        if (!existingExpense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        const expense = await server_1.prisma.expense.update({
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
        await (0, calculations_1.calculateDailyTotals)(hostelId, existingExpense.date);
        if (date && new Date(date).toDateString() !== existingExpense.date.toDateString()) {
            await (0, calculations_1.calculateDailyTotals)(hostelId, new Date(date));
        }
        const updateData = await (0, calculations_1.triggerRealTimeUpdate)(hostelId, 'expense');
        server_2.io.to(`hostel-${hostelId}`).emit('expense-updated', {
            expense: {
                ...expense,
                amount: expense.amount.toNumber(),
            },
            ...updateData,
        });
        res.json({
            message: 'Expense updated successfully',
            expense: {
                ...expense,
                amount: expense.amount.toNumber(),
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Update expense error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', auth_1.authenticateToken, auth_1.requireHostelAccess, async (req, res) => {
    try {
        const { id } = zod_1.z.object({ id: zod_1.z.string().uuid() }).parse(req.params);
        const hostelId = req.query.hostelId;
        const existingExpense = await server_1.prisma.expense.findFirst({
            where: { id, hostelId },
        });
        if (!existingExpense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        await server_1.prisma.expense.delete({
            where: { id },
        });
        await (0, calculations_1.calculateDailyTotals)(hostelId, existingExpense.date);
        const updateData = await (0, calculations_1.triggerRealTimeUpdate)(hostelId, 'expense');
        server_2.io.to(`hostel-${hostelId}`).emit('expense-deleted', {
            expenseId: id,
            ...updateData,
        });
        res.json({ message: 'Expense deleted successfully' });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Delete expense error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/categories', auth_1.authenticateToken, async (req, res) => {
    try {
        const hostelId = req.query.hostelId;
        if (!hostelId) {
            return res.status(400).json({ error: 'Hostel ID required' });
        }
        const categories = await server_1.prisma.expense.findMany({
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
        const summary = await server_1.prisma.expense.groupBy({
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
//# sourceMappingURL=expenses.js.map