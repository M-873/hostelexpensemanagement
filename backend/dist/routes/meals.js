"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const mealUpsertSchema = zod_1.z.object({
    date: zod_1.z.string().datetime(),
    count: zod_1.z.number().min(0),
    userId: zod_1.z.string().uuid(),
    hostelId: zod_1.z.string().uuid(),
});
router.get('/', auth_1.authenticateToken, auth_1.requireHostelAccess, async (req, res) => {
    try {
        const hostelId = req.query.hostelId;
        const date = req.query.date;
        const where = { hostelId };
        if (date) {
            where.date = new Date(date);
        }
        const meals = await prisma_1.prisma.meal.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });
        res.json({ meals });
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/upsert', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), auth_1.requireHostelAccess, async (req, res) => {
    try {
        const { date, count, userId, hostelId } = mealUpsertSchema.parse(req.body);
        const meal = await prisma_1.prisma.meal.upsert({
            where: {
                meal_date_userId: {
                    hostelId,
                    date: new Date(date),
                    userId,
                }
            },
            update: { count },
            create: {
                date: new Date(date),
                count,
                userId,
                hostelId,
            }
        });
        res.json({ message: 'Meal updated successfully', meal });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=meals.js.map