import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../server';
import { AuthRequest, AuthResponse } from '../types';
import { generateOTP, sendOTP, verifyOTP, isOTPExpired } from '../services/otpService';

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email().regex(/@gmail\.com$/, 'Must be a Gmail address'),
  password: z.string().min(6),
  role: z.enum(['admin', 'user']),
});

const registerSchema = z.object({
  email: z.string().email().regex(/@gmail\.com$/, 'Must be a Gmail address'),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['admin', 'user', 'manager']).optional(),
  hostelId: z.string().uuid().optional(),
});

const otpRequestSchema = z.object({
  email: z.string().email().regex(/@gmail\.com$/, 'Must be a Gmail address'),
});

const otpVerifySchema = z.object({
  email: z.string().email().regex(/@gmail\.com$/, 'Must be a Gmail address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['admin', 'user', 'manager']).optional(),
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
    if (!user.isEmailVerified) {
      return res.status(401).json({ error: 'Please verify your email before logging in' });
    }

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
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
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

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request OTP for registration
router.post('/request-otp', async (req, res) => {
  try {
    const { email } = otpRequestSchema.parse(req.body);

    // Check if user already exists and is verified
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({ error: 'User already exists and is verified' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database (create temporary user or update existing)
    if (existingUser) {
      // Update existing unverified user
      await prisma.user.update({
        where: { email },
        data: { otp, otpExpiry },
      });
    } else {
      // Create temporary user entry (will be completed after OTP verification)
      await prisma.user.create({
        data: {
          email,
          password: '', // Will be set after OTP verification
          name: '', // Will be set after OTP verification
          role: 'user',
          hostelId: '00000000-0000-0000-0000-000000000000', // Temporary UUID
          otp,
          otpExpiry,
          isEmailVerified: false,
        },
      });
    }

    // Send OTP email
    await sendOTP(email, otp);

    res.json({ message: 'OTP sent successfully', email });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('OTP request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP and complete registration
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, password, name, role, hostelId } = otpVerifySchema.parse(req.body);

    // Find user with OTP
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ error: 'No OTP found' });
    }

    if (isOTPExpired(user.otpExpiry)) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Verify OTP
    if (!verifyOTP(user.otp, otp)) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user with verified data
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        name,
        role: role || 'user',
        hostelId,
        otp: null,
        otpExpiry: null,
        isEmailVerified: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: updatedUser.id, role: updatedUser.role, hostelId: updatedUser.hostelId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const response: AuthResponse = {
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        hostelId: updatedUser.hostelId || undefined,
      },
    };

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
        role: role || 'user',
        hostelId,
      },
    });

    const response: AuthResponse = {
      token: jwt.sign(
        { userId: user.id, role: user.role, hostelId: user.hostelId },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      ),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hostelId: user.hostelId || undefined,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
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

    res.json({
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

export default router;