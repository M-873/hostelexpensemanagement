import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { prisma as prismaClient } from '../prisma';
import { AuthResponse } from '../types';

const prisma = prismaClient as any;
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Missing credential' });
        }

        // Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return res.status(400).json({ error: 'Invalid token payload' });
        }

        const { email, name, picture, sub: googleId } = payload;
        const { role: requestedRole } = req.body;

        // Check if user exists
        let user = await prisma.user.findUnique({
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

        if (user) {
            // Update existing user with Google ID if missing
            if (!user.googleId || user.avatar !== picture) {
                user = await prisma.user.update({
                    where: { email },
                    data: {
                        googleId,
                        avatar: picture,
                        isEmailVerified: true // Trust Google verified emails
                    },
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
            }
        } else {
            // Create new user
            // If requestedRole is ADMIN, set it, otherwise default to USER
            const finalRole = requestedRole === 'ADMIN' ? 'ADMIN' : 'USER';

            user = await prisma.user.create({
                data: {
                    email,
                    name: name || 'Google User',
                    googleId,
                    avatar: picture,
                    role: finalRole,
                    isEmailVerified: true,
                },
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
        }

        // Generate JWT
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
                // avatar: user.avatar // Typedef might need update
            },
        };

        return res.json(response);

    } catch (error) {
        console.error('Google Auth Error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
});

export default router;
