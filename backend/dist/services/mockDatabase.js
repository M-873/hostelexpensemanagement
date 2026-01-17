"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeMockData = exports.mockDatabase = void 0;
const uuid_1 = require("uuid");
const mockHostels = [
    {
        id: '550e8400-e29b-41d4-a716-446655440000',
        registrationNumber: 'HOSTEL001',
        name: 'Test Hostel',
        address: '123 Test Street',
        phone: '1234567890',
        email: 'test@hostel.com',
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];
const mockUsers = [
    {
        id: '660e8400-e29b-41d4-a716-446655440001',
        email: 'admin@hostel.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        name: 'Admin User',
        role: 'admin',
        hostelId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '770e8400-e29b-41d4-a716-446655440002',
        email: 'user@hostel.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        name: 'Regular User',
        role: 'user',
        hostelId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];
const mockExpenses = [];
const mockDeposits = [];
const mockDailyCalculations = [];
const mockNotices = [];
const mockNotes = [];
exports.mockDatabase = {
    hostel: {
        findUnique: async ({ where, select }) => {
            const hostel = mockHostels.find(h => h.id === where.id || h.registrationNumber === where.registrationNumber);
            if (!hostel)
                return null;
            if (select && select._count) {
                return {
                    ...hostel,
                    _count: {
                        users: mockUsers.filter(u => u.hostelId === hostel.id).length,
                        expenses: mockExpenses.filter(e => e.hostelId === hostel.id).length,
                        deposits: mockDeposits.filter(d => d.hostelId === hostel.id).length,
                    }
                };
            }
            return hostel;
        },
        findMany: async () => mockHostels,
        create: async ({ data }) => {
            const newHostel = { ...data, id: (0, uuid_1.v4)(), createdAt: new Date(), updatedAt: new Date() };
            mockHostels.push(newHostel);
            return newHostel;
        }
    },
    user: {
        findUnique: async ({ where }) => {
            return mockUsers.find(u => u.email === where.email || u.id === where.id) || null;
        },
        create: async ({ data }) => {
            const newUser = { ...data, id: (0, uuid_1.v4)(), createdAt: new Date(), updatedAt: new Date() };
            mockUsers.push(newUser);
            return newUser;
        },
        update: async ({ where, data }) => {
            const userIndex = mockUsers.findIndex(u => u.email === where.email || u.id === where.id);
            if (userIndex === -1)
                return null;
            mockUsers[userIndex] = { ...mockUsers[userIndex], ...data, updatedAt: new Date() };
            return mockUsers[userIndex];
        }
    },
    expense: {
        findMany: async ({ where, orderBy }) => {
            let expenses = [...mockExpenses];
            if (where?.hostelId) {
                expenses = expenses.filter(e => e.hostelId === where.hostelId);
            }
            if (where?.date?.gte) {
                expenses = expenses.filter(e => new Date(e.date) >= new Date(where.date.gte));
            }
            if (orderBy?.date === 'desc') {
                expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            }
            return expenses;
        },
        create: async ({ data }) => {
            const newExpense = {
                ...data,
                id: (0, uuid_1.v4)(),
                createdAt: new Date(),
                updatedAt: new Date(),
                amount: {
                    toNumber: () => parseFloat(data.amount)
                }
            };
            mockExpenses.push(newExpense);
            return newExpense;
        },
        update: async ({ where, data }) => {
            const index = mockExpenses.findIndex(e => e.id === where.id);
            if (index === -1)
                return null;
            mockExpenses[index] = { ...mockExpenses[index], ...data, updatedAt: new Date() };
            return mockExpenses[index];
        },
        delete: async ({ where }) => {
            const index = mockExpenses.findIndex(e => e.id === where.id);
            if (index === -1)
                return null;
            const deleted = mockExpenses[index];
            mockExpenses.splice(index, 1);
            return deleted;
        },
        groupBy: async ({ by, where }) => {
            const expenses = await this.findMany({ where });
            const groups = {};
            expenses.forEach(expense => {
                const key = expense[by[0]];
                if (!groups[key]) {
                    groups[key] = { [by[0]]: key, _sum: { amount: 0 }, _count: { _all: 0 } };
                }
                groups[key]._sum.amount += parseFloat(expense.amount);
                groups[key]._count._all += 1;
            });
            return Object.values(groups);
        },
        aggregate: async ({ where, _sum }) => {
            let expenses = [...mockExpenses];
            if (where?.hostelId) {
                expenses = expenses.filter(e => e.hostelId === where.hostelId);
            }
            if (where?.date?.gte) {
                expenses = expenses.filter(e => new Date(e.date) >= new Date(where.date.gte));
            }
            if (where?.date?.lte) {
                expenses = expenses.filter(e => new Date(e.date) <= new Date(where.date.lte));
            }
            let total = 0;
            expenses.forEach(expense => {
                total += expense.amount.toNumber ? expense.amount.toNumber() : parseFloat(expense.amount);
            });
            return { _sum: { amount: total } };
        }
    },
    deposit: {
        findMany: async ({ where, orderBy }) => {
            let deposits = [...mockDeposits];
            if (where?.hostelId) {
                deposits = deposits.filter(d => d.hostelId === where.hostelId);
            }
            if (where?.date?.gte) {
                deposits = deposits.filter(d => new Date(d.date) >= new Date(where.date.gte));
            }
            if (orderBy?.date === 'desc') {
                deposits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            }
            return deposits;
        },
        create: async ({ data }) => {
            const newDeposit = { ...data, id: (0, uuid_1.v4)(), createdAt: new Date(), updatedAt: new Date() };
            mockDeposits.push(newDeposit);
            return newDeposit;
        },
        update: async ({ where, data }) => {
            const index = mockDeposits.findIndex(d => d.id === where.id);
            if (index === -1)
                return null;
            mockDeposits[index] = { ...mockDeposits[index], ...data, updatedAt: new Date() };
            return mockDeposits[index];
        },
        delete: async ({ where }) => {
            const index = mockDeposits.findIndex(d => d.id === where.id);
            if (index === -1)
                return null;
            const deleted = mockDeposits[index];
            mockDeposits.splice(index, 1);
            return deleted;
        },
        aggregate: async ({ where, _sum }) => {
            let deposits = [...mockDeposits];
            if (where?.hostelId) {
                deposits = deposits.filter(d => d.hostelId === where.hostelId);
            }
            if (where?.date?.gte) {
                deposits = deposits.filter(d => new Date(d.date) >= new Date(where.date.gte));
            }
            if (where?.date?.lte) {
                deposits = deposits.filter(d => new Date(d.date) <= new Date(where.date.lte));
            }
            let total = 0;
            deposits.forEach(deposit => {
                total += deposit.amount.toNumber ? deposit.amount.toNumber() : parseFloat(deposit.amount);
            });
            return { _sum: { amount: total } };
        }
    },
    dailyCalculation: {
        findUnique: async ({ where }) => {
            return mockDailyCalculations.find(dc => dc.hostelId === where.hostelId_date.hostelId &&
                dc.date.toDateString() === where.hostelId_date.date.toDateString()) || null;
        },
        upsert: async ({ where, update, create }) => {
            const existing = await exports.mockDatabase.dailyCalculation.findUnique({ where });
            if (existing) {
                const index = mockDailyCalculations.findIndex(dc => dc.hostelId === where.hostelId_date.hostelId &&
                    dc.date.toDateString() === where.hostelId_date.date.toDateString());
                if (index !== -1) {
                    mockDailyCalculations[index] = { ...existing, ...update, updatedAt: new Date() };
                    return mockDailyCalculations[index];
                }
            }
            const newCalc = { ...create, id: (0, uuid_1.v4)(), createdAt: new Date(), updatedAt: new Date() };
            mockDailyCalculations.push(newCalc);
            return newCalc;
        }
    },
    noticeBoard: {
        findUnique: async ({ where }) => {
            return mockNotices.find(n => n.id === where.id) || null;
        },
        findMany: async ({ where, orderBy }) => {
            let notices = [...mockNotices];
            if (where?.hostelId) {
                notices = notices.filter(n => n.hostelId === where.hostelId);
            }
            if (where?.isActive !== undefined) {
                notices = notices.filter(n => n.isActive === where.isActive);
            }
            if (where?.priority) {
                notices = notices.filter(n => n.priority === where.priority);
            }
            if (orderBy?.createdAt === 'desc') {
                notices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            }
            else if (orderBy?.priority) {
                const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'NORMAL': 2, 'LOW': 1 };
                notices.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            }
            return notices;
        },
        create: async ({ data }) => {
            const newNotice = {
                ...data,
                id: (0, uuid_1.v4)(),
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: data.isActive !== undefined ? data.isActive : true,
                priority: data.priority || 'NORMAL'
            };
            mockNotices.push(newNotice);
            return newNotice;
        },
        update: async ({ where, data }) => {
            const index = mockNotices.findIndex(n => n.id === where.id);
            if (index === -1)
                return null;
            mockNotices[index] = { ...mockNotices[index], ...data, updatedAt: new Date() };
            return mockNotices[index];
        },
        delete: async ({ where }) => {
            const index = mockNotices.findIndex(n => n.id === where.id);
            if (index === -1)
                return null;
            const deleted = mockNotices[index];
            mockNotices.splice(index, 1);
            return deleted;
        }
    },
    note: {
        findUnique: async ({ where }) => {
            return mockNotes.find(n => n.id === where.id) || null;
        },
        findMany: async ({ where, orderBy }) => {
            let notes = [...mockNotes];
            if (where?.hostelId) {
                notes = notes.filter(n => n.hostelId === where.hostelId);
            }
            if (where?.category) {
                notes = notes.filter(n => n.category === where.category);
            }
            if (where?.isPublic !== undefined) {
                notes = notes.filter(n => n.isPublic === where.isPublic);
            }
            if (orderBy?.createdAt === 'desc') {
                notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            }
            else if (orderBy?.category) {
                notes.sort((a, b) => a.category.localeCompare(b.category));
            }
            return notes;
        },
        create: async ({ data }) => {
            const newNote = {
                ...data,
                id: (0, uuid_1.v4)(),
                createdAt: new Date(),
                updatedAt: new Date(),
                isPublic: data.isPublic !== undefined ? data.isPublic : true,
                category: data.category || 'GENERAL'
            };
            mockNotes.push(newNote);
            return newNote;
        },
        update: async ({ where, data }) => {
            const index = mockNotes.findIndex(n => n.id === where.id);
            if (index === -1)
                return null;
            mockNotes[index] = { ...mockNotes[index], ...data, updatedAt: new Date() };
            return mockNotes[index];
        },
        delete: async ({ where }) => {
            const index = mockNotes.findIndex(n => n.id === where.id);
            if (index === -1)
                return null;
            const deleted = mockNotes[index];
            mockNotes.splice(index, 1);
            return deleted;
        }
    },
    $transaction: async (operations) => {
        const results = [];
        for (const operation of operations) {
            results.push(await operation);
        }
        return results;
    }
};
const initializeMockData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    mockExpenses.push({
        id: (0, uuid_1.v4)(),
        amount: { toNumber: () => 150.50 },
        category: 'Food',
        description: 'Breakfast items',
        date: today,
        hostelId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date(),
        updatedAt: new Date(),
    }, {
        id: (0, uuid_1.v4)(),
        amount: { toNumber: () => 200.00 },
        category: 'Utilities',
        description: 'Electricity bill',
        date: today,
        hostelId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    mockDeposits.push({
        id: (0, uuid_1.v4)(),
        amount: { toNumber: () => 500.00 },
        description: 'Monthly contribution',
        date: today,
        hostelId: '550e8400-e29b-41d4-a716-446655440000',
        userId: '2',
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    mockDailyCalculations.push({
        id: (0, uuid_1.v4)(),
        date: today,
        hostelId: '550e8400-e29b-41d4-a716-446655440000',
        totalExpenses: { toNumber: () => 350.50 },
        totalDeposits: { toNumber: () => 500.00 },
        netBalance: { toNumber: () => 149.50 },
        createdAt: new Date(),
        updatedAt: new Date(),
    });
};
exports.initializeMockData = initializeMockData;
exports.default = exports.mockDatabase;
//# sourceMappingURL=mockDatabase.js.map