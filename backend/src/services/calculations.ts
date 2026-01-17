import { prisma } from '../server';

export async function calculateDailyTotals(hostelId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Calculate total expenses for the day
  const expenses = await prisma.expense.aggregate({
    where: {
      hostelId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    _sum: {
      amount: true,
    },
  });

  // Calculate total deposits for the day
  const deposits = await prisma.deposit.aggregate({
    where: {
      hostelId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const totalExpenses = expenses._sum.amount || 0;
  const totalDeposits = deposits._sum.amount || 0;
  const netBalance = totalDeposits - totalExpenses;

  // Update or create daily calculation
  const dailyCalculation = await prisma.dailyCalculation.upsert({
    where: {
      hostelId_date: {
        hostelId,
        date: startOfDay,
      },
    },
    update: {
      totalExpenses,
      totalDeposits,
      netBalance,
    },
    create: {
      hostelId,
      date: startOfDay,
      totalExpenses,
      totalDeposits,
      netBalance,
    },
  });

  return dailyCalculation;
}

export async function getCurrentBalance(hostelId: string): Promise<number> {
  try {
    // Get all daily calculations for this hostel
    const calculations = await prisma.dailyCalculation.findMany({
      where: { hostelId },
      select: { netBalance: true },
    });

    // Sum all net balances to get current balance
    return calculations.reduce((total: number, calc: { netBalance: number }) => {
      const balance = calc.netBalance;
      if (typeof balance === 'number') {
        return total + balance;
      } else if (balance && typeof balance === 'object' && 'toNumber' in balance && typeof balance.toNumber === 'function') {
        return total + balance.toNumber();
      } else if (balance && typeof balance === 'object' && typeof balance.valueOf === 'function') {
        return total + balance.valueOf();
      } else if (balance !== null && balance !== undefined) {
        return total + (parseFloat(String(balance)) || 0);
      } else {
        return total;
      }
    }, 0);
  } catch (error) {
    console.error('Error in getCurrentBalance:', error);
    return 0; // Return 0 if there's an error
  }
}

export async function getDashboardCalculations(hostelId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const calculations = await prisma.dailyCalculation.findMany({
    where: {
      hostelId,
      date: {
        gte: startDate,
      },
    },
    orderBy: {
      date: 'desc',
    },
    take: days,
  });

  return calculations.map(calc => ({
    date: calc.date.toISOString().split('T')[0],
    totalExpenses: calc.totalExpenses.toNumber(),
    totalDeposits: calc.totalDeposits.toNumber(),
    netBalance: calc.netBalance.toNumber(),
  }));
}

export async function triggerRealTimeUpdate(hostelId: string, updateType: 'expense' | 'deposit') {
  try {
    // Calculate current balance
    const currentBalance = await getCurrentBalance(hostelId);
    
    // Get recent transactions
    const recentTransactions = await getRecentTransactions(hostelId, 10);
    
    // Get dashboard calculations
    const dailyCalculations = await getDashboardCalculations(hostelId, 30);

    return {
      currentBalance,
      recentTransactions,
      dailyCalculations,
      updateType,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error in triggerRealTimeUpdate:', error);
    // Return default values if there's an error
    return {
      currentBalance: 0,
      recentTransactions: [],
      dailyCalculations: [],
      updateType,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getRecentTransactions(hostelId: string, limit: number = 10) {
  const [expenses, deposits] = await Promise.all([
    prisma.expense.findMany({
      where: { hostelId },
      select: {
        id: true,
        amount: true,
        description: true,
        date: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.deposit.findMany({
      where: { hostelId },
      select: {
        id: true,
        amount: true,
        description: true,
        date: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
  ]);

  const transactions = [
    ...expenses.map(e => ({
      id: e.id,
      type: 'expense' as const,
      amount: e.amount.toNumber(),
      description: e.description,
      date: e.date.toISOString(),
      user: { name: e.user.name },
    })),
    ...deposits.map(d => ({
      id: d.id,
      type: 'deposit' as const,
      amount: d.amount.toNumber(),
      description: d.description,
      date: d.date.toISOString(),
      user: { name: d.user.name },
    })),
  ];

  // Sort by date and take the most recent
  return transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}