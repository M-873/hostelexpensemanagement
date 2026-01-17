"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataCleanupService = exports.DataCleanupService = void 0;
exports.runCleanup = runCleanup;
const node_cron_1 = __importDefault(require("node-cron"));
const server_1 = require("../server");
class DataCleanupService {
    constructor() {
        this.initializeCleanupJobs();
    }
    static getInstance() {
        if (!DataCleanupService.instance) {
            DataCleanupService.instance = new DataCleanupService();
        }
        return DataCleanupService.instance;
    }
    initializeCleanupJobs() {
        node_cron_1.default.schedule('0 3 * * *', async () => {
            console.log('Starting data cleanup job...');
            await this.cleanupOldData();
        });
        node_cron_1.default.schedule('0 2 * * 0', async () => {
            console.log('Starting weekly deep cleanup...');
            await this.deepCleanup();
        });
        console.log('Data cleanup jobs scheduled successfully');
    }
    async cleanupOldData() {
        try {
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const deletedExpenses = await server_1.prisma.expense.deleteMany({
                where: {
                    createdAt: {
                        lt: ninetyDaysAgo
                    }
                }
            });
            const deletedDeposits = await server_1.prisma.deposit.deleteMany({
                where: {
                    createdAt: {
                        lt: ninetyDaysAgo
                    }
                }
            });
            const deletedCalculations = await server_1.prisma.dailyCalculation.deleteMany({
                where: {
                    date: {
                        lt: ninetyDaysAgo
                    }
                }
            });
            const deletedNotices = await server_1.prisma.noticeBoard.deleteMany({
                where: {
                    isActive: false,
                    createdAt: {
                        lt: thirtyDaysAgo
                    }
                }
            });
            const deletedNotes = await server_1.prisma.note.deleteMany({
                where: {
                    isPublic: false,
                    createdAt: {
                        lt: thirtyDaysAgo
                    }
                }
            });
            console.log(`Cleanup completed:
        - Expenses deleted: ${deletedExpenses.count}
        - Deposits deleted: ${deletedDeposits.count}
        - Daily calculations deleted: ${deletedCalculations.count}
        - Inactive notices deleted: ${deletedNotices.count}
        - Private notes deleted: ${deletedNotes.count}
      `);
        }
        catch (error) {
            console.error('Error during data cleanup:', error);
        }
    }
    async deepCleanup() {
        try {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            const oldDataStats = await this.getOldDataStats(oneYearAgo);
            console.log(`Deep cleanup stats:
        - Hostels with no recent activity: ${oldDataStats.inactiveHostels}
        - Users with no recent activity: ${oldDataStats.inactiveUsers}
        - Total data older than 1 year: ${oldDataStats.totalOldRecords}
      `);
        }
        catch (error) {
            console.error('Error during deep cleanup:', error);
        }
    }
    async getOldDataStats(cutoffDate) {
        return {
            inactiveHostels: 0,
            inactiveUsers: 0,
            totalOldRecords: 0
        };
    }
    async manualCleanup() {
        console.log('Starting manual cleanup...');
        await this.cleanupOldData();
        console.log('Manual cleanup completed');
    }
    async getCleanupStats() {
        return {
            lastCleanup: new Date(),
            nextCleanup: new Date(Date.now() + 24 * 60 * 60 * 1000),
            scheduledJobs: 2
        };
    }
}
exports.DataCleanupService = DataCleanupService;
exports.dataCleanupService = DataCleanupService.getInstance();
async function runCleanup() {
    await exports.dataCleanupService.manualCleanup();
}
if (require.main === module) {
    console.log('Running standalone cleanup...');
    runCleanup()
        .then(() => {
        console.log('Standalone cleanup completed');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Standalone cleanup failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=dataCleanup.js.map