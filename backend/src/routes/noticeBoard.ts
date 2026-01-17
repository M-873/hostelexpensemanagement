import express from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// Zod schemas for validation
const createNoticeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(2000, 'Content too long'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  isActive: z.boolean().optional(),
});

const updateNoticeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  content: z.string().min(1, 'Content is required').max(2000, 'Content too long').optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  isActive: z.boolean().optional(),
});

// Get all notices for a hostel
router.get('/hostel/:hostelId', authenticateToken, async (req, res) => {
  try {
    const { hostelId } = req.params;
    const { priority, isActive } = req.query;

    const where: { hostelId: string; priority?: string; isActive?: boolean } = { hostelId };
    if (priority) where.priority = priority;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const notices = await prisma.noticeBoard.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    res.json(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});

// Get a specific notice
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await prisma.noticeBoard.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    return res.json(notice);
  } catch (error) {
    console.error('Error fetching notice:', error);
    res.status(500).json({ error: 'Failed to fetch notice' });
  }
});

// Create a new notice
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, content, priority = 'NORMAL', isActive = true } = createNoticeSchema.parse(req.body);
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hostelId: true }
    });

    if (!user || !user.hostelId) {
      return res.status(400).json({ error: 'User must be associated with a hostel' });
    }

    const notice = await prisma.noticeBoard.create({
      data: {
        title,
        content,
        priority,
        isActive,
        createdBy: userId,
        hostelId: user.hostelId,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Emit real-time notification to all users in the hostel
    const io = req.app.get('io');
    if (io) {
      io.to(`hostel-${user.hostelId}`).emit('newNotice', {
        notice,
        message: `New ${priority.toLowerCase()} priority notice: ${title}`
      });
    }

    return res.status(201).json(notice);
  } catch (error) {
    console.error('Error creating notice:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    } else {
      return res.status(500).json({ error: 'Failed to create notice' });
    }
  }
});

// Update a notice
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updates = updateNoticeSchema.parse(req.body);
    const userId = req.user.id;

    // Check if notice exists and user has permission
    const existingNotice = await prisma.noticeBoard.findUnique({
      where: { id },
      include: { createdByUser: true }
    });

    if (!existingNotice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    // Allow editing by creator or any admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (existingNotice.createdBy !== userId && user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only the creator or admin can edit this notice' });
    }

    const notice = await prisma.noticeBoard.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Emit real-time notification for notice update
    const io = req.app.get('io');
    if (io) {
      io.to(`hostel-${existingNotice.hostelId}`).emit('updatedNotice', {
        notice,
        message: `Notice updated: ${notice.title}`
      });
    }

    return res.json(notice);
  } catch (error) {
    console.error('Error updating notice:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      res.status(500).json({ error: 'Failed to update notice' });
    }
  }
});

// Delete a notice
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if notice exists and user has permission
    const existingNotice = await prisma.noticeBoard.findUnique({
      where: { id },
      include: { createdByUser: true }
    });

    if (!existingNotice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    // Allow deletion by creator or any admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (existingNotice.createdBy !== userId && user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only the creator or admin can delete this notice' });
    }

    await prisma.noticeBoard.delete({
      where: { id }
    });

    // Emit real-time notification for notice deletion
    const io = req.app.get('io');
    if (io) {
      io.to(`hostel-${existingNotice.hostelId}`).emit('deletedNotice', {
        noticeId: id,
        message: `Notice deleted: ${existingNotice.title}`
      });
    }

    return res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ error: 'Failed to delete notice' });
  }
});

export default router;