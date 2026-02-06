import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma as prismaClient } from '../prisma';
const prisma = prismaClient as any;
import { AuthRequest, AuthResponse } from '../types';


const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'USER', 'MANAGER']),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['ADMIN', 'USER', 'MANAGER']).optional(),
  hostelId: z.string().uuid().optional(),
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = loginSchema.parse(req.body);

    // Find user with hostel info
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

    // Check if email is verified
    // if (!user.isEmailVerified) {
    //   return res.status(401).json({ error: 'Please verify your email before logging in' });
    // }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify role
    if (user.role !== role) {
      return res.status(401).json({ error: 'Invalid role' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role, hostelId: user.hostelId },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' } as any
    );

    const response: AuthResponse = {
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Register endpoint (for creating new users)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, hostelId } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
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

    const response: AuthResponse = {
      token: jwt.sign(
        { userId: user.id, role: user.role, hostelId: user.hostelId },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' } as any
      ),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hostelId: user.hostelId || undefined,
      },
    };

    return res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

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
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
});

// Update user profile (name)
router.put('/update-profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { name } = z.object({ name: z.string().min(2) }).parse(req.body);

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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    return res.status(403).json({ error: 'Invalid token or update failed' });
  }
});

export default router;
