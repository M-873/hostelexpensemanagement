export declare class DataCleanupService {
    private static instance;
    private constructor();
    static getInstance(): DataCleanupService;
    private initializeCleanupJobs;
    private cleanupOldData;
    private deepCleanup;
    private getOldDataStats;
    manualCleanup(): Promise<void>;
    getCleanupStats(): Promise<{
        lastCleanup: Date | null;
        nextCleanup: Date | null;
        scheduledJobs: number;
    }>;
}
export declare const dataCleanupService: DataCleanupService;
export declare function runCleanup(): Promise<void>;
//# sourceMappingURL=dataCleanup.d.ts.map