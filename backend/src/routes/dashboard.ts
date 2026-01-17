import express from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { authenticateToken, requireHostelAccess, AuthenticatedRequest } from '../middleware/auth';
import { getCurrentBalance, getDashboardCalculations, getRecentTransactions } from '../services/calculations';

// Interface for Prisma groupBy results with category aggregation
interface CategoryAggregation {
  category: string;
  _sum: {
    amount: number | null;
  };
}

const router = express.Router();

// Get dashboard overview
router.get('/overview', authenticateToken, requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const hostelId = req.query.hostelId as string;

    // Get current balance
    const currentBalance = await getCurrentBalance(hostelId);

    // Get today's totals
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayTotals, yesterdayTotals, recentTransactions, hostelStats] = await Promise.all([
      // Today's totals
      prisma.dailyCalculation.findUnique({
        where: {
          hostelId_date: {
            hostelId,
            date: today,
          },
        },
      }),
      // Yesterday's totals
      prisma.dailyCalculation.findUnique({
        where: {
          hostelId_date: {
            hostelId,
            date: new Date(today.getTime() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Recent transactions
      getRecentTransactions(hostelId, 10),
      // Hostel statistics
      prisma.hostel.findUnique({
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
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard charts data
router.get('/charts', authenticateToken, requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const hostelId = req.query.hostelId as string;
    const { days = 30 } = req.query;

    const dashboardCalculations = await getDashboardCalculations(hostelId, Number(days));

    // Get category breakdown for expenses
    const expenseCategories = await prisma.expense.groupBy({
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

    // Get category breakdown for deposits
    const depositCategories = await prisma.deposit.groupBy({
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
        expenseCategories: expenseCategories.map((cat: CategoryAggregation) => ({
          category: cat.category,
          total: cat._sum.amount?.toNumber() || 0,
        })),
        depositCategories: depositCategories.map((cat: CategoryAggregation) => ({
          category: cat.category,
          total: cat._sum.amount?.toNumber() || 0,
        })),
      },
    });
  } catch (error) {
    console.error('Get dashboard charts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get monthly summary
router.get('/summary', authenticateToken, requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const hostelId = req.query.hostelId as string;
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);

    const [monthlyCalculations, expenseCategories, depositCategories, memberStats] = await Promise.all([
      // Monthly calculations
      prisma.dailyCalculation.findMany({
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
      // Expense categories for the month
      prisma.expense.groupBy({
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
      // Deposit categories for the month
      prisma.deposit.groupBy({
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
      // Member statistics
      prisma.user.findMany({
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

    const monthlyTotal = monthlyCalculations.reduce(
      (acc, calc) => ({
        totalExpenses: acc.totalExpenses + calc.totalExpenses.toNumber(),
        totalDeposits: acc.totalDeposits + calc.totalDeposits.toNumber(),
        netBalance: acc.netBalance + calc.netBalance.toNumber(),
      }),
      { totalExpenses: 0, totalDeposits: 0, netBalance: 0 }
    );

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
  } catch (error) {
    console.error('Get monthly summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get real-time updates (for WebSocket connection)
router.get('/realtime', authenticateToken, requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const hostelId = req.query.hostelId as string;

    const [currentBalance, recentTransactions, todayTotals] = await Promise.all([
      getCurrentBalance(hostelId),
      getRecentTransactions(hostelId, 5),
      prisma.dailyCalculation.findUnique({
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
  } catch (error) {
    console.error('Get real-time data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export data
router.get('/export', authenticateToken, requireHostelAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const hostelId = req.query.hostelId as string;
    const { format = 'json', startDate, endDate } = req.query;

    const where: { hostelId: string; date?: { gte?: Date; lte?: Date } } = { hostelId };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    const [expenses, deposits, calculations] = await Promise.all([
      prisma.expense.findMany({
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
      prisma.deposit.findMany({
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
      prisma.dailyCalculation.findMany({
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
      // Convert to CSV format
      const csvData = convertToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="hostel-data-${Date.now()}.csv"`);
      return res.send(csvData);
    }

    res.json(exportData);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function convertToCSV(data: { expenses: { id: string; description: string; amount: number; date: string; category: string }[]; deposits: { id: string; description: string; amount: number; date: string }[]; dailyCalculations: { date: string; totalExpenses: number; totalDeposits: number; netBalance: number }[] }): string {
  let csv = '';
  
  // Expenses CSV
  csv += 'Expenses\n';
  csv += 'Date,Amount,Description,Category,User,Email,Created At\n';
  data.expenses.forEach((expense: { date: Date; amount: number; description: string; category: string; userName: string; userEmail: string; createdAt: Date }) => {
    csv += `${expense.date.toISOString()},${expense.amount},"${expense.description}","${expense.category}","${expense.userName}","${expense.userEmail}",${expense.createdAt.toISOString()}\n`;
  });
  
  csv += '\n';
  
  // Deposits CSV
  csv += 'Deposits\n';
  csv += 'Date,Amount,Description,Category,User,Email,Created At\n';
  data.deposits.forEach((deposit: { date: Date; amount: number; description: string; category: string; userName: string; userEmail: string; createdAt: Date }) => {
    csv += `${deposit.date.toISOString()},${deposit.amount},"${deposit.description}","${deposit.category}","${deposit.userName}","${deposit.userEmail}",${deposit.createdAt.toISOString()}\n`;
  });
  
  csv += '\n';
  
  // Calculations CSV
  csv += 'Daily Calculations\n';
  csv += 'Date,Total Expenses,Total Deposits,Net Balance\n';
  data.calculations.forEach((calc: { date: string; totalExpenses: number; totalDeposits: number; netBalance: number }) => {
    csv += `${calc.date},${calc.totalExpenses},${calc.totalDeposits},${calc.netBalance}\n`;
  });
  
  return csv;
}

export default router;