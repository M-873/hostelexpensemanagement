import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  hostelId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    hostelId?: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        hostelId: true,
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

export const requireHostelAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const hostelId = req.params.hostelId || req.body.hostelId;
  
  if (!hostelId) {
    return res.status(400).json({ error: 'Hostel ID required' });
  }

  if (req.user?.role === 'admin') {
    return next();
  }

  if (req.user?.hostelId !== hostelId) {
    return res.status(403).json({ error: 'Access denied to this hostel' });
  }

  next();
};