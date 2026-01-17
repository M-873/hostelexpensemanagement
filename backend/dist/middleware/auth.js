"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireHostelAccess = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = require("../server");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await server_1.prisma.user.findUnique({
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
    }
    catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};
exports.requireRole = requireRole;
const requireHostelAccess = async (req, res, next) => {
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
exports.requireHostelAccess = requireHostelAccess;
//# sourceMappingURL=auth.js.map