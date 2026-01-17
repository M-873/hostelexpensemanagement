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
const createNoteSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long'),
    content: zod_1.z.string().min(1, 'Content is required').max(5000, 'Content too long'),
    category: zod_1.z.enum(['GENERAL', 'ACCOUNTS', 'BAZAAR', 'MAINTENANCE', 'MEETING', 'OTHER']).optional(),
    isPublic: zod_1.z.boolean().optional(),
});
const updateNoteSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
    content: zod_1.z.string().min(1, 'Content is required').max(5000, 'Content too long').optional(),
    category: zod_1.z.enum(['GENERAL', 'ACCOUNTS', 'BAZAAR', 'MAINTENANCE', 'MEETING', 'OTHER']).optional(),
    isPublic: zod_1.z.boolean().optional(),
});
router.get('/hostel/:hostelId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { hostelId } = req.params;
        const { category, isPublic } = req.query;
        const where = { hostelId };
        if (category)
            where.category = category;
        if (isPublic !== undefined)
            where.isPublic = isPublic === 'true';
        const notes = await server_1.prisma.note.findMany({
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
    }
    catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const note = await server_1.prisma.note.findUnique({
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
    }
    catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ error: 'Failed to fetch note' });
    }
});
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { title, content, category = 'GENERAL', isPublic = true } = createNoteSchema.parse(req.body);
        const userId = req.user.id;
        const user = await server_1.prisma.user.findUnique({
            where: { id: userId },
            select: { hostelId: true }
        });
        if (!user || !user.hostelId) {
            return res.status(400).json({ error: 'User must be associated with a hostel' });
        }
        const note = await server_1.prisma.note.create({
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
    }
    catch (error) {
        console.error('Error creating note:', error);
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: error.errors[0].message });
        }
        else {
            res.status(500).json({ error: 'Failed to create note' });
        }
    }
});
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { id } = req.params;
        const updates = updateNoteSchema.parse(req.body);
        const userId = req.user.id;
        const existingNote = await server_1.prisma.note.findUnique({
            where: { id },
            include: { createdByUser: true }
        });
        if (!existingNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        if (existingNote.createdBy !== userId) {
            return res.status(403).json({ error: 'Only the creator can edit this note' });
        }
        const note = await server_1.prisma.note.update({
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
    }
    catch (error) {
        console.error('Error updating note:', error);
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: error.errors[0].message });
        }
        else {
            res.status(500).json({ error: 'Failed to update note' });
        }
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { id } = req.params;
        const userId = req.user.id;
        const existingNote = await server_1.prisma.note.findUnique({
            where: { id },
            include: { createdByUser: true }
        });
        if (!existingNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        if (existingNote.createdBy !== userId) {
            return res.status(403).json({ error: 'Only the creator can delete this note' });
        }
        await server_1.prisma.note.delete({
            where: { id }
        });
        return res.json({ message: 'Note deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});
exports.default = router;
//# sourceMappingURL=notes.js.map