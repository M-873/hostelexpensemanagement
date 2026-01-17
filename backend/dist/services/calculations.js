"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDailyTotals = calculateDailyTotals;
exports.getCurrentBalance = getCurrentBalance;
exports.getDashboardCalculations = getDashboardCalculations;
exports.triggerRealTimeUpdate = triggerRealTimeUpdate;
exports.getRecentTransactions = getRecentTransactions;
const server_1 = require("../server");
async function calculateDailyTotals(hostelId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const expenses = await server_1.prisma.expense.aggregate({
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
    const deposits = await server_1.prisma.deposit.aggregate({
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
    const dailyCalculation = await server_1.prisma.dailyCalculation.upsert({
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
async function getCurrentBalance(hostelId) {
    try {
        const calculations = await server_1.prisma.dailyCalculation.findMany({
            where: { hostelId },
            select: { netBalance: true },
        });
        return calculations.reduce((total, calc) => {
            const balance = calc.netBalance;
            if (typeof balance === 'number') {
                return total + balance;
            }
            else if (balance && typeof balance === 'object' && 'toNumber' in balance && typeof balance.toNumber === 'function') {
                return total + balance.toNumber();
            }
            else if (balance && typeof balance === 'object' && typeof balance.valueOf === 'function') {
                return total + balance.valueOf();
            }
            else if (balance !== null && balance !== undefined) {
                return total + (parseFloat(String(balance)) || 0);
            }
            else {
                return total;
            }
        }, 0);
    }
    catch (error) {
        console.error('Error in getCurrentBalance:', error);
        return 0;
    }
}
async function getDashboardCalculations(hostelId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const calculations = await server_1.prisma.dailyCalculation.findMany({
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
async function triggerRealTimeUpdate(hostelId, updateType) {
    try {
        const currentBalance = await getCurrentBalance(hostelId);
        const recentTransactions = await getRecentTransactions(hostelId, 10);
        const dailyCalculations = await getDashboardCalculations(hostelId, 30);
        return {
            currentBalance,
            recentTransactions,
            dailyCalculations,
            updateType,
            timestamp: new Date().toISOString(),
        };
    }
    catch (error) {
        console.error('Error in triggerRealTimeUpdate:', error);
        return {
            currentBalance: 0,
            recentTransactions: [],
            dailyCalculations: [],
            updateType,
            timestamp: new Date().toISOString(),
        };
    }
}
async function getRecentTransactions(hostelId, limit = 10) {
    const [expenses, deposits] = await Promise.all([
        server_1.prisma.expense.findMany({
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
        server_1.prisma.deposit.findMany({
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
            type: 'expense',
            amount: e.amount.toNumber(),
            description: e.description,
            date: e.date.toISOString(),
            user: { name: e.user.name },
        })),
        ...deposits.map(d => ({
            id: d.id,
            type: 'deposit',
            amount: d.amount.toNumber(),
            description: d.description,
            date: d.date.toISOString(),
            user: { name: d.user.name },
        })),
    ];
    return transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
}
//# sourceMappingURL=calculations.js.map