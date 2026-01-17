import express from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { io } from '../server';
import { authenticateToken, requireRole, requireHostelAccess, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Schema for hostel creation
const createHostelSchema = z.object({
  name: z.string().min(1).max(100),
  registrationNumber: z.string().regex(/^\d{6}$/, 'Registration number must be exactly 6 digits'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

// Schema for membership request
const membershipRequestSchema = z.object({
  hostelId: z.string().uuid(),
  message: z.string().optional(),
});

// Schema for responding to membership requests
const respondMembershipSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(['approved', 'rejected']),
});

// Create a new hostel (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const { name, registrationNumber, address, phone, email } = createHostelSchema.parse(req.body);

    // Check if registration number already exists
    const existingHostel = await prisma.hostel.findUnique({
      where: { registrationNumber },
    });

    if (existingHostel) {
      return res.status(400).json({ error: 'Registration number already exists' });
    }

    // Create the hostel
    const hostel = await prisma.hostel.create({
      data: {
        name,
        registrationNumber,
        address,
        phone,
        email,
      },
    });

    // Associate the admin user with this hostel
    if (req.user) {
      await prisma.user.update({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create hostel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search for hostels by registration number
router.get('/search/:registrationNumber', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { registrationNumber } = z.object({
      registrationNumber: z.string().min(1),
    }).parse(req.params);

    const hostels = await prisma.hostel.findMany({
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
      take: 10, // Limit results
    });

    res.json({ hostels });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Search hostels error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all hostels (Admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const hostels = await prisma.hostel.findMany({
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
  } catch (error) {
    console.error('Get hostels error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get hostel by ID (with proper access control)
router.get('/:id', authenticateToken, requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = z.object({
      id: z.string().uuid(),
    }).parse(req.params);

    const hostel = await prisma.hostel.findUnique({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Get hostel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request membership to a hostel (User only)
router.post('/membership-request', authenticateToken, requireRole(['user']), async (req: AuthenticatedRequest, res) => {
  try {
    const { hostelId, message } = membershipRequestSchema.parse(req.body);

    // Check if user is already associated with a hostel
    if (req.user?.hostelId) {
      return res.status(400).json({ error: 'You are already a member of a hostel' });
    }

    // Check if hostel exists
    const hostel = await prisma.hostel.findUnique({
      where: { id: hostelId },
    });

    if (!hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }

    // Check if user count is under 100
    const userCount = await prisma.user.count({
      where: { hostelId },
    });

    if (userCount >= 100) {
      return res.status(400).json({ error: 'Hostel has reached maximum capacity of 100 members' });
    }

    // Create membership request (using a temporary approach since we don't have a separate requests table)
    // For now, we'll directly associate the user with the hostel
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: { hostelId },
    });

    // Emit real-time update to hostel members
    io.to(`hostel-${hostelId}`).emit('member-joined', {
      userId: req.user!.id,
      userName: req.user!.name,
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Membership request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get hostel members (Admin/Manager only)
router.get('/:id/members', authenticateToken, requireRole(['admin', 'manager']), requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = z.object({
      id: z.string().uuid(),
    }).parse(req.params);

    const members = await prisma.user.findMany({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update hostel details (Admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = z.object({
      id: z.string().uuid(),
    }).parse(req.params);

    const { name, address, phone, email } = createHostelSchema.partial().parse(req.body);

    const hostel = await prisma.hostel.update({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update hostel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete hostel (Admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = z.object({
      id: z.string().uuid(),
    }).parse(req.params);

    // Check if hostel exists
    const hostel = await prisma.hostel.findUnique({
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

    // Check if hostel has data (soft delete approach)
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

    await prisma.hostel.delete({
      where: { id },
    });

    res.json({ message: 'Hostel deleted successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Delete hostel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;