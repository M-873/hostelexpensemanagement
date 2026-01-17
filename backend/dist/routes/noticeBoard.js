"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const server_1 = require("../server");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const createNoticeSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long'),
    content: zod_1.z.string().min(1, 'Content is required').max(2000, 'Content too long'),
    priority: zod_1.z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    isActive: zod_1.z.boolean().optional(),
});
const updateNoticeSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
    content: zod_1.z.string().min(1, 'Content is required').max(2000, 'Content too long').optional(),
    priority: zod_1.z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    isActive: zod_1.z.boolean().optional(),
});
router.get('/hostel/:hostelId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { hostelId } = req.params;
        const { priority, isActive } = req.query;
        const where = { hostelId };
        if (priority)
            where.priority = priority;
        if (isActive !== undefined)
            where.isActive = isActive === 'true';
        const notices = await server_1.prisma.noticeBoard.findMany({
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
    }
    catch (error) {
        console.error('Error fetching notices:', error);
        res.status(500).json({ error: 'Failed to fetch notices' });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const notice = await server_1.prisma.noticeBoard.findUnique({
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
    }
    catch (error) {
        console.error('Error fetching notice:', error);
        res.status(500).json({ error: 'Failed to fetch notice' });
    }
});
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { title, content, priority = 'NORMAL', isActive = true } = createNoticeSchema.parse(req.body);
        const userId = req.user.id;
        const user = await server_1.prisma.user.findUnique({
            where: { id: userId },
            select: { hostelId: true }
        });
        if (!user || !user.hostelId) {
            return res.status(400).json({ error: 'User must be associated with a hostel' });
        }
        const notice = await server_1.prisma.noticeBoard.create({
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
        const io = req.app.get('io');
        if (io) {
            io.to(`hostel-${user.hostelId}`).emit('newNotice', {
                notice,
                message: `New ${priority.toLowerCase()} priority notice: ${title}`
            });
        }
        return res.status(201).json(notice);
    }
    catch (error) {
        console.error('Error creating notice:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        else {
            return res.status(500).json({ error: 'Failed to create notice' });
        }
    }
});
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = updateNoticeSchema.parse(req.body);
        const userId = req.user.id;
        const existingNotice = await server_1.prisma.noticeBoard.findUnique({
            where: { id },
            include: { createdByUser: true }
        });
        if (!existingNotice) {
            return res.status(404).json({ error: 'Notice not found' });
        }
        const user = await server_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });
        if (existingNotice.createdBy !== userId && user?.role !== 'admin') {
            return res.status(403).json({ error: 'Only the creator or admin can edit this notice' });
        }
        const notice = await server_1.prisma.noticeBoard.update({
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
        const io = req.app.get('io');
        if (io) {
            io.to(`hostel-${existingNotice.hostelId}`).emit('updatedNotice', {
                notice,
                message: `Notice updated: ${notice.title}`
            });
        }
        return res.json(notice);
    }
    catch (error) {
        console.error('Error updating notice:', error);
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: error.errors[0].message });
        }
        else {
            res.status(500).json({ error: 'Failed to update notice' });
        }
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const existingNotice = await server_1.prisma.noticeBoard.findUnique({
            where: { id },
            include: { createdByUser: true }
        });
        if (!existingNotice) {
            return res.status(404).json({ error: 'Notice not found' });
        }
        const user = await server_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });
        if (existingNotice.createdBy !== userId && user?.role !== 'admin') {
            return res.status(403).json({ error: 'Only the creator or admin can delete this notice' });
        }
        await server_1.prisma.noticeBoard.delete({
            where: { id }
        });
        const io = req.app.get('io');
        if (io) {
            io.to(`hostel-${existingNotice.hostelId}`).emit('deletedNotice', {
                noticeId: id,
                message: `Notice deleted: ${existingNotice.title}`
            });
        }
        return res.json({ message: 'Notice deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting notice:', error);
        res.status(500).json({ error: 'Failed to delete notice' });
    }
});
exports.default = router;
//# sourceMappingURL=noticeBoard.js.map