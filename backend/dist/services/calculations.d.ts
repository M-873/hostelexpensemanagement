export declare function calculateDailyTotals(hostelId: string, date: Date): Promise<any>;
export declare function getCurrentBalance(hostelId: string): Promise<number>;
export declare function getDashboardCalculations(hostelId: string, days?: number): Promise<any>;
export declare function triggerRealTimeUpdate(hostelId: string, updateType: 'expense' | 'deposit'): Promise<{
    currentBalance: number;
    recentTransactions: any[];
    dailyCalculations: any;
    updateType: "expense" | "deposit";
    timestamp: string;
}>;
export declare function getRecentTransactions(hostelId: string, limit?: number): Promise<any[]>;
//# sourceMappingURL=calculations.d.ts.map