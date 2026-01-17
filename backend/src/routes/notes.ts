import express from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Zod schemas for validation
const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  category: z.enum(['GENERAL', 'ACCOUNTS', 'BAZAAR', 'MAINTENANCE', 'MEETING', 'OTHER']).optional(),
  isPublic: z.boolean().optional(),
});

const updateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long').optional(),
  category: z.enum(['GENERAL', 'ACCOUNTS', 'BAZAAR', 'MAINTENANCE', 'MEETING', 'OTHER']).optional(),
  isPublic: z.boolean().optional(),
});

// Get all notes for a hostel
router.get('/hostel/:hostelId', authenticateToken, async (req, res) => {
  try {
    const { hostelId } = req.params;
    const { category, isPublic } = req.query;

    const where: { hostelId: string; category?: string; isPublic?: boolean } = { hostelId };
    if (category) where.category = category;
    if (isPublic !== undefined) where.isPublic = isPublic === 'true';

    const notes = await prisma.note.findMany({
      where,
      orderBy: [
        { category: 'asc' },
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

    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get a specific note
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const note = await prisma.note.findUnique({
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

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    return res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Create a new note
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const { title, content, category = 'GENERAL', isPublic = true } = createNoteSchema.parse(req.body);
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hostelId: true }
    });

    if (!user || !user.hostelId) {
      return res.status(400).json({ error: 'User must be associated with a hostel' });
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        category,
        isPublic,
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

    return res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      res.status(500).json({ error: 'Failed to create note' });
    }
  }
});

// Update a note
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const { id } = req.params;
    const updates = updateNoteSchema.parse(req.body);
    const userId = req.user.id;

    // Check if note exists and user has permission
    const existingNote = await prisma.note.findUnique({
      where: { id },
      include: { createdByUser: true }
    });

    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Allow editing by creator only (notes are more personal)
    if (existingNote.createdBy !== userId) {
      return res.status(403).json({ error: 'Only the creator can edit this note' });
    }

    const note = await prisma.note.update({
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

    return res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      res.status(500).json({ error: 'Failed to update note' });
    }
  }
});

// Delete a note
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const { id } = req.params;
    const userId = req.user.id;

    // Check if note exists and user has permission
    const existingNote = await prisma.note.findUnique({
      where: { id },
      include: { createdByUser: true }
    });

    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Allow deletion by creator only (notes are more personal)
    if (existingNote.createdBy !== userId) {
      return res.status(403).json({ error: 'Only the creator can delete this note' });
    }

    await prisma.note.delete({
      where: { id }
    });

    return res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;