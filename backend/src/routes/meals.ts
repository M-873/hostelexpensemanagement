import express from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticateToken, requireRole, requireHostelAccess, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

const mealUpsertSchema = z.object({
    date: z.string().datetime(),
    count: z.number().min(0),
    userId: z.string().uuid(),
    hostelId: z.string().uuid(),
});

// Get all meals for a hostel/date
router.get('/', authenticateToken, requireHostelAccess, async (req: AuthenticatedRequest, res): Promise<any> => {
    try {
        const hostelId = req.query.hostelId as string;
        const date = req.query.date as string;

        const where: any = { hostelId };
        if (date) {
            where.date = new Date(date);
        }

        const meals = await (prisma as any).meal.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        res.json({ meals });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Upsert a meal record (Admin only)
router.post('/upsert', authenticateToken, requireRole(['ADMIN']), requireHostelAccess, async (req: AuthenticatedRequest, res): Promise<any> => {
    try {
        const { date, count, userId, hostelId } = mealUpsertSchema.parse(req.body);

        const meal = await (prisma as any).meal.upsert({
            where: {
                meal_date_userId: {
                    hostelId,
                    date: new Date(date),
                    userId,
                }
            },
            update: { count },
            create: {
                date: new Date(date),
                count,
                userId,
                hostelId,
            }
        });

        res.json({ message: 'Meal updated successfully', meal });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
