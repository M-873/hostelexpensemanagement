"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../prisma");
const prisma = prisma_1.prisma;
const router = express_1.default.Router();
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ error: 'Missing credential' });
        }
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
            if (!user.googleId || user.avatar !== picture) {
                user = await prisma.user.update({
                    where: { email },
                    data: {
                        googleId,
                        avatar: picture,
                        isEmailVerified: true
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
        }
        else {
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
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, hostelId: user.hostelId }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const response = {
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
    }
    catch (error) {
        console.error('Google Auth Error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
});
exports.default = router;
//# sourceMappingURL=googleAuth.js.map