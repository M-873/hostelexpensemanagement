"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const auth_1 = require("../middleware/auth");
const calculations_1 = require("../services/calculations");
const router = express_1.default.Router();
router.get('/overview', auth_1.authenticateToken, auth_1.requireHostelAccess, async (req, res) => {
    try {
        const hostelId = req.query.hostelId;
        const currentBalance = await (0, calculations_1.getCurrentBalance)(hostelId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [todayTotals, yesterdayTotals, recentTransactions, hostelStats] = await Promise.all([
            server_1.prisma.dailyCalculation.findUnique({
                where: {
                    hostelId_date: {
                        hostelId,
                        date: today,
                    },
                },
            }),
            server_1.prisma.dailyCalculation.findUnique({
                where: {
                    hostelId_date: {
                        hostelId,
                        date: new Date(today.getTime() - 24 * 60 * 60 * 1000),
                    },
                },
            }),
            (0, calculations_1.getRecentTransactions)(hostelId, 10),
            server_1.prisma.hostel.findUnique({
                where: { id: hostelId },
                select: {
                    id: true,
                    name: true,
                    registrationNumber: true,
                    _count: {
                        select: {
                            users: true,
                            expenses: true,
                            deposits: true,
                        },
                    },
                },
            }),
        ]);
        res.json({
            overview: {
                currentBalance,
                today: {
                    totalExpenses: todayTotals?.totalExpenses.toNumber() || 0,
                    totalDeposits: todayTotals?.totalDeposits.toNumber() || 0,
                    netBalance: todayTotals?.netBalance.toNumber() || 0,
                },
                yesterday: {
                    totalExpenses: yesterdayTotals?.totalExpenses.toNumber() || 0,
                    totalDeposits: yesterdayTotals?.totalDeposits.toNumber() || 0,
                    netBalance: yesterdayTotals?.netBalance.toNumber() || 0,
                },
                hostel: hostelStats,
                recentTransactions,
            },
        });
        return;
    }
    catch (error) {
        console.error('Get dashboard overview error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/charts', auth_1.authenticateToken, auth_1.requireHostelAccess, async (req, res) => {
    try {
        const hostelId = req.query.hostelId;
        const { days = 30 } = req.query;
        const dashboardCalculations = await (0, calculations_1.getDashboardCalculations)(hostelId, Number(days));
        const expenseCategories = await server_1.prisma.expense.groupBy({
            by: ['category'],
            where: {
                hostelId,
                date: {
                    gte: new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000),
                },
            },
            _sum: {
                amount: true,
            },
        });
        const depositCategories = await server_1.prisma.deposit.groupBy({
            by: ['category'],
            where: {
                hostelId,
                date: {
                    gte: new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000),
                },
            },
            _sum: {
                amount: true,
            },
        });
        res.json({
            charts: {
                balanceTrend: dashboardCalculations,
                expenseCategories: expenseCategories.map((cat) => ({
                    category: cat.category,
                    total: cat._sum.amount?.toNumber() || 0,
                })),
                depositCategories: depositCategories.map((cat) => ({
                    category: cat.category,
                    total: cat._sum.amount?.toNumber() || 0,
                })),
            },
        });
    }
    catch (error) {
        console.error('Get dashboard charts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/summary', auth_1.authenticateToken, auth_1.requireHostelAccess, async (req, res) => {
    try {
        const hostelId = req.query.hostelId;
        const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0);
        const [monthlyCalculations, expenseCategories, depositCategories, memberStats] = await Promise.all([
            server_1.prisma.dailyCalculation.findMany({
                where: {
                    hostelId,
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                orderBy: {
                    date: 'asc',
                },
            }),
            server_1.prisma.expense.groupBy({
                by: ['category'],
                where: {
                    hostelId,
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                _sum: {
                    amount: true,
                },
                _count: {
                    amount: true,
                },
            }),
            server_1.prisma.deposit.groupBy({
                by: ['category'],
                where: {
                    hostelId,
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                _sum: {
                    amount: true,
                },
                _count: {
                    amount: true,
                },
            }),
            server_1.prisma.user.findMany({
                where: {
                    hostelId,
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                },
            }),
        ]);
        const monthlyTotal = monthlyCalculations.reduce((acc, calc) => ({
            totalExpenses: acc.totalExpenses + calc.totalExpenses.toNumber(),
            totalDeposits: acc.totalDeposits + calc.totalDeposits.toNumber(),
            netBalance: acc.netBalance + calc.netBalance.toNumber(),
        }), { totalExpenses: 0, totalDeposits: 0, netBalance: 0 });
        res.json({
            summary: {
                period: {
                    year: Number(year),
                    month: Number(month),
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                },
                totals: monthlyTotal,
                expenseCategories: expenseCategories.map(cat => ({
                    category: cat.category,
                    total: cat._sum.amount.toNumber(),
                    count: cat._count.amount,
                })),
                depositCategories: depositCategories.map(cat => ({
                    category: cat.category,
                    total: cat._sum.amount.toNumber(),
                    count: cat._count.amount,
                })),
                newMembers: memberStats,
                dailyBreakdown: monthlyCalculations.map(calc => ({
                    date: calc.date.toISOString(),
                    totalExpenses: calc.totalExpenses.toNumber(),
                    totalDeposits: calc.totalDeposits.toNumber(),
                    netBalance: calc.netBalance.toNumber(),
                })),
            },
        });
    }
    catch (error) {
        console.error('Get monthly summary error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/realtime', auth_1.authenticateToken, auth_1.requireHostelAccess, async (req, res) => {
    try {
        const hostelId = req.query.hostelId;
        const [currentBalance, recentTransactions, todayTotals] = await Promise.all([
            (0, calculations_1.getCurrentBalance)(hostelId),
            (0, calculations_1.getRecentTransactions)(hostelId, 5),
            server_1.prisma.dailyCalculation.findUnique({
                where: {
                    hostelId_date: {
                        hostelId,
                        date: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),
        ]);
        res.json({
            realtime: {
                currentBalance,
                todayTotals: {
                    totalExpenses: todayTotals?.totalExpenses.toNumber() || 0,
                    totalDeposits: todayTotals?.totalDeposits.toNumber() || 0,
                    netBalance: todayTotals?.netBalance.toNumber() || 0,
                },
                recentTransactions,
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error('Get real-time data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/export', auth_1.authenticateToken, auth_1.requireHostelAccess, async (req, res) => {
    try {
        const hostelId = req.query.hostelId;
        const { format = 'json', startDate, endDate } = req.query;
        const where = { hostelId };
        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date.gte = new Date(startDate);
            }
            if (endDate) {
                where.date.lte = new Date(endDate);
            }
        }
        const [expenses, deposits, calculations] = await Promise.all([
            server_1.prisma.expense.findMany({
                where,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { date: 'desc' },
            }),
            server_1.prisma.deposit.findMany({
                where,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { date: 'desc' },
            }),
            server_1.prisma.dailyCalculation.findMany({
                where,
                orderBy: { date: 'desc' },
            }),
        ]);
        const exportData = {
            expenses: expenses.map(e => ({
                ...e,
                amount: e.amount.toNumber(),
                userName: e.user.name,
                userEmail: e.user.email,
            })),
            deposits: deposits.map(d => ({
                ...d,
                amount: d.amount.toNumber(),
                userName: d.user.name,
                userEmail: d.user.email,
            })),
            calculations: calculations.map(c => ({
                date: c.date.toISOString(),
                totalExpenses: c.totalExpenses.toNumber(),
                totalDeposits: c.totalDeposits.toNumber(),
                netBalance: c.netBalance.toNumber(),
            })),
            exportedAt: new Date().toISOString(),
            hostelId,
        };
        if (format === 'csv') {
            const csvData = convertToCSV(exportData);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="hostel-data-${Date.now()}.csv"`);
            return res.send(csvData);
        }
        res.json(exportData);
    }
    catch (error) {
        console.error('Export data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
function convertToCSV(data) {
    let csv = '';
    csv += 'Expenses\n';
    csv += 'Date,Amount,Description,Category,User,Email,Created At\n';
    data.expenses.forEach((expense) => {
        csv += `${expense.date.toISOString()},${expense.amount},"${expense.description}","${expense.category}","${expense.userName}","${expense.userEmail}",${expense.createdAt.toISOString()}\n`;
    });
    csv += '\n';
    csv += 'Deposits\n';
    csv += 'Date,Amount,Description,Category,User,Email,Created At\n';
    data.deposits.forEach((deposit) => {
        csv += `${deposit.date.toISOString()},${deposit.amount},"${deposit.description}","${deposit.category}","${deposit.userName}","${deposit.userEmail}",${deposit.createdAt.toISOString()}\n`;
    });
    csv += '\n';
    csv += 'Daily Calculations\n';
    csv += 'Date,Total Expenses,Total Deposits,Net Balance\n';
    data.calculations.forEach((calc) => {
        csv += `${calc.date},${calc.totalExpenses},${calc.totalDeposits},${calc.netBalance}\n`;
    });
    return csv;
}
exports.default = router;
//# sourceMappingURL=dashboard.js.map