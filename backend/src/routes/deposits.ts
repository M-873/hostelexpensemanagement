import express from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { io } from '../server';
import { authenticateToken, requireRole, requireHostelAccess, AuthenticatedRequest } from '../middleware/auth';
import { calculateDailyTotals, triggerRealTimeUpdate } from '../services/calculations';

const router = express.Router();

// Schema for creating a deposit
const createDepositSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1).max(200),
  category: z.string().min(1).max(50),
  date: z.string().datetime(),
  hostelId: z.string().uuid(),
});

// Schema for updating a deposit
const updateDepositSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(50).optional(),
  date: z.string().datetime().optional(),
});

// Get all deposits for a hostel (with pagination and filtering)
router.get('/', authenticateToken, requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 20, category, startDate, endDate } = req.query;
    const hostelId = req.query.hostelId as unknown as string;

    const skip = (Number(page) - 1) * Number(limit);
    const where: { hostelId: string; category?: string; date?: { gte?: Date; lte?: Date } } = { hostelId };

    if (category) {
      where.category = category as string;
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

    const [deposits, total] = await Promise.all([
      (prisma.deposit as any).findMany({
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
      prisma.deposit.count({ where }),
    ]);

    return res.json({
      deposits: (deposits as any[]).map((deposit: any) => ({
        ...deposit,
        amount: (deposit as any).amount.toNumber(),
        category: (deposit as any).category,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new deposit
router.post('/', authenticateToken, requireRole(['ADMIN']), requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const { amount, description, category, date, hostelId } = createDepositSchema.parse(req.body);

    const deposit = await (prisma.deposit as any).create({
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

    // Calculate daily totals for the deposit date
    await calculateDailyTotals(hostelId, new Date(date));

    // Trigger real-time update
    const updateData = await triggerRealTimeUpdate(hostelId, 'deposit');
    io.to(`hostel-${hostelId}`).emit('deposit-created', {
      deposit: {
        ...deposit,
        amount: deposit.amount.toNumber(),
      },
      ...updateData,
    });

    return res.status(201).json({
      message: 'Deposit created successfully',
      deposit: {
        ...deposit,
        amount: deposit.amount.toNumber(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create deposit error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deposit by ID
router.get('/:id', authenticateToken, requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const hostelId = req.query.hostelId as string;

    const deposit = await prisma.deposit.findFirst({
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

    return res.json({
      deposit: {
        ...deposit,
        amount: deposit.amount.toNumber(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Get deposit error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update deposit
router.put('/:id', authenticateToken, requireRole(['ADMIN']), requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const { amount, description, category, date } = updateDepositSchema.parse(req.body);
    const hostelId = req.query.hostelId as string;

    // Check if deposit exists and belongs to the hostel
    const existingDeposit = await prisma.deposit.findFirst({
      where: { id, hostelId },
    });

    if (!existingDeposit) {
      return res.status(404).json({ error: 'Deposit not found' });
    }

    const deposit = await (prisma.deposit as any).update({
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
    await calculateDailyTotals(hostelId, existingDeposit.date);
    if (date && new Date(date).toDateString() !== existingDeposit.date.toDateString()) {
      await calculateDailyTotals(hostelId, new Date(date));
    }

    // Trigger real-time update
    const updateData = await triggerRealTimeUpdate(hostelId, 'deposit');
    io.to(`hostel-${hostelId}`).emit('deposit-updated', {
      deposit: {
        ...deposit,
        amount: deposit.amount.toNumber(),
      },
      ...updateData,
    });

    return res.json({
      message: 'Deposit updated successfully',
      deposit: {
        ...deposit,
        amount: deposit.amount.toNumber(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update deposit error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete deposit
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const hostelId = req.query.hostelId as string;

    // Check if deposit exists and belongs to the hostel
    const existingDeposit = await prisma.deposit.findFirst({
      where: { id, hostelId },
    });

    if (!existingDeposit) {
      return res.status(404).json({ error: 'Deposit not found' });
    }

    await prisma.deposit.delete({
      where: { id },
    });

    // Recalculate daily totals for the deposit date
    await calculateDailyTotals(hostelId, existingDeposit.date);

    // Trigger real-time update
    const updateData = await triggerRealTimeUpdate(hostelId, 'deposit');
    io.to(`hostel-${hostelId}`).emit('deposit-deleted', {
      depositId: id,
      ...updateData,
    });

    return res.json({ message: 'Deposit deleted successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Delete deposit error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deposit categories
router.get('/categories', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const hostelId = req.query.hostelId as string;

    if (!hostelId) {
      return res.status(400).json({ error: 'Hostel ID required' });
    }

    const categories = await prisma.deposit.findMany({
      where: { hostelId },
      select: {
        category: true,
      } as any,
      distinct: ['category'],
    });

    return res.json({
      categories: categories.map((c: any) => c.category),
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deposit summary by category
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

    const summary = await (prisma.deposit as any).groupBy({
      by: ['category'],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    return res.json({
      summary: summary.map((item: any) => ({
        category: item.category,
        totalAmount: item._sum?.amount ? Number(item._sum.amount) : 0,
        count: item._count?.id || 0,
      })),
    });
  } catch (error) {
    console.error('Get category summary error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;