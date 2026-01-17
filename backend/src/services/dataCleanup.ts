import cron from 'node-cron';
import { prisma } from '../server';

// Auto cleanup service for old data
export class DataCleanupService {
  private static instance: DataCleanupService;

  private constructor() {
    this.initializeCleanupJobs();
  }

  public static getInstance(): DataCleanupService {
    if (!DataCleanupService.instance) {
      DataCleanupService.instance = new DataCleanupService();
    }
    return DataCleanupService.instance;
  }

  private initializeCleanupJobs(): void {
    // Run cleanup daily at 3 AM
    cron.schedule('0 3 * * *', async () => {
      console.log('Starting data cleanup job...');
      await this.cleanupOldData();
    });

    // Run weekly cleanup on Sundays at 2 AM
    cron.schedule('0 2 * * 0', async () => {
      console.log('Starting weekly deep cleanup...');
      await this.deepCleanup();
    });

    console.log('Data cleanup jobs scheduled successfully');
  }

  private async cleanupOldData(): Promise<void> {
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Delete old expenses (90+ days)
      const deletedExpenses = await prisma.expense.deleteMany({
        where: {
          createdAt: {
            lt: ninetyDaysAgo
          }
        }
      });

      // Delete old deposits (90+ days)
      const deletedDeposits = await prisma.deposit.deleteMany({
        where: {
          createdAt: {
            lt: ninetyDaysAgo
          }
        }
      });

      // Delete old daily calculations (90+ days)
      const deletedCalculations = await prisma.dailyCalculation.deleteMany({
        where: {
          date: {
            lt: ninetyDaysAgo
          }
        }
      });

      // Delete old inactive notices (30+ days)
      const deletedNotices = await prisma.noticeBoard.deleteMany({
        where: {
          isActive: false,
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      });

      // Delete old private notes (30+ days)
      const deletedNotes = await prisma.note.deleteMany({
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

    } catch (error) {
      console.error('Error during data cleanup:', error);
    }
  }

  private async deepCleanup(): Promise<void> {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      // Archive old data (you could implement archiving logic here)
      // For now, we'll just log what would be archived
      const oldDataStats = await this.getOldDataStats(oneYearAgo);
      
      console.log(`Deep cleanup stats:
        - Hostels with no recent activity: ${oldDataStats.inactiveHostels}
        - Users with no recent activity: ${oldDataStats.inactiveUsers}
        - Total data older than 1 year: ${oldDataStats.totalOldRecords}
      `);

      // You could implement archiving logic here
      // await this.archiveOldData(oneYearAgo);

    } catch (error) {
      console.error('Error during deep cleanup:', error);
    }
  }

  private async getOldDataStats(cutoffDate: Date): Promise<{
    inactiveHostels: number;
    inactiveUsers: number;
    totalOldRecords: number;
  }> {
    // This is a placeholder for getting statistics
    // You could implement actual logic to check for inactive hostels/users
    return {
      inactiveHostels: 0,
      inactiveUsers: 0,
      totalOldRecords: 0
    };
  }

  public async manualCleanup(): Promise<void> {
    console.log('Starting manual cleanup...');
    await this.cleanupOldData();
    console.log('Manual cleanup completed');
  }

  public async getCleanupStats(): Promise<{
    lastCleanup: Date | null;
    nextCleanup: Date | null;
    scheduledJobs: number;
  }> {
    // This would track cleanup statistics
    // For now, return basic info
    return {
      lastCleanup: new Date(),
      nextCleanup: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
      scheduledJobs: 2
    };
  }
}

// Export singleton instance
export const dataCleanupService = DataCleanupService.getInstance();

// Standalone function for manual cleanup
export async function runCleanup(): Promise<void> {
  await dataCleanupService.manualCleanup();
}

// If this file is run directly, execute cleanup
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