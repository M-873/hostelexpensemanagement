import express from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { io } from '../server';
import { authenticateToken, requireHostelAccess, AuthenticatedRequest } from '../middleware/auth';
import { calculateDailyTotals, triggerRealTimeUpdate } from '../services/calculations';

const router = express.Router();

// Schema for creating an expense
const createExpenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1).max(200),
  category: z.string().min(1).max(50),
  date: z.string().datetime(),
  hostelId: z.string().uuid(),
});

// Schema for updating an expense
const updateExpenseSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(50).optional(),
  date: z.string().datetime().optional(),
});

// Get all expenses for a hostel (with pagination and filtering)
router.get('/', authenticateToken, requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 20, category, startDate, endDate } = req.query;
    const hostelId = req.query.hostelId as string;

    const skip = (Number(page) - 1) * Number(limit);
    const where: { hostelId: string; category?: string; date?: { gte?: Date; lte?: Date } } = { hostelId };

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
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
      prisma.expense.count({ where }),
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
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new expense
router.post('/', authenticateToken, requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const { amount, description, category, date, hostelId } = createExpenseSchema.parse(req.body);

    const expense = await prisma.expense.create({
      data: {
        amount,
        description,
        category,
        date: new Date(date),
        hostelId,
        userId: req.user!.id,
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

    // Calculate daily totals for the expense date
    await calculateDailyTotals(hostelId, new Date(date));

    // Trigger real-time update
    const updateData = await triggerRealTimeUpdate(hostelId, 'expense');
    io.to(`hostel-${hostelId}`).emit('expense-created', {
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get expense by ID
router.get('/:id', authenticateToken, requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const hostelId = req.query.hostelId as string;

    const expense = await prisma.expense.findFirst({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update expense
router.put('/:id', authenticateToken, requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const { amount, description, category, date } = updateExpenseSchema.parse(req.body);
    const hostelId = req.query.hostelId as string;

    // Check if expense exists and belongs to the hostel
    const existingExpense = await prisma.expense.findFirst({
      where: { id, hostelId },
    });

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const expense = await prisma.expense.update({
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

    // Recalculate daily totals for both old and new dates
    await calculateDailyTotals(hostelId, existingExpense.date);
    if (date && new Date(date).toDateString() !== existingExpense.date.toDateString()) {
      await calculateDailyTotals(hostelId, new Date(date));
    }

    // Trigger real-time update
    const updateData = await triggerRealTimeUpdate(hostelId, 'expense');
    io.to(`hostel-${hostelId}`).emit('expense-updated', {
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete expense
router.delete('/:id', authenticateToken, requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const hostelId = req.query.hostelId as string;

    // Check if expense exists and belongs to the hostel
    const existingExpense = await prisma.expense.findFirst({
      where: { id, hostelId },
    });

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await prisma.expense.delete({
      where: { id },
    });

    // Recalculate daily totals for the expense date
    await calculateDailyTotals(hostelId, existingExpense.date);

    // Trigger real-time update
    const updateData = await triggerRealTimeUpdate(hostelId, 'expense');
    io.to(`hostel-${hostelId}`).emit('expense-deleted', {
      expenseId: id,
      ...updateData,
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get expense categories
router.get('/categories', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const hostelId = req.query.hostelId as string;
    
    if (!hostelId) {
      return res.status(400).json({ error: 'Hostel ID required' });
    }

    const categories = await prisma.expense.findMany({
      where: { hostelId },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    res.json({
      categories: categories.map(c => c.category),
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get expense summary by category
router.get('/summary/category', authenticateToken, requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const hostelId = req.query.hostelId as string;
    const { startDate, endDate } = req.query;

    const where: { hostelId: string; date?: { gte?: Date; lte?: Date } } = { hostelId };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    const summary = await prisma.expense.groupBy({
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
  } catch (error) {
    console.error('Get category summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;