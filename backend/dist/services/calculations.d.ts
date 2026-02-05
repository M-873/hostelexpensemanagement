export declare function calculateDailyTotals(hostelId: string, date: Date): Promise<{
    date: Date;
    hostelId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    totalExpenses: import("@prisma/client/runtime/library").Decimal;
    totalDeposits: import("@prisma/client/runtime/library").Decimal;
    netBalance: import("@prisma/client/runtime/library").Decimal;
}>;
export declare function getCurrentBalance(hostelId: string): Promise<number>;
export declare function getDashboardCalculations(hostelId: string, days?: number): Promise<{
    date: any;
    totalExpenses: any;
    totalDeposits: any;
    netBalance: any;
}[]>;
export declare function triggerRealTimeUpdate(hostelId: string, updateType: 'expense' | 'deposit'): Promise<{
    currentBalance: number;
    recentTransactions: ({
        id: any;
        type: "expense";
        amount: any;
        description: any;
        date: any;
        user: {
            name: any;
        };
    } | {
        id: any;
        type: "deposit";
        amount: any;
        description: any;
        date: any;
        user: {
            name: any;
        };
    })[];
    dailyCalculations: {
        date: any;
        totalExpenses: any;
        totalDeposits: any;
        netBalance: any;
    }[];
    updateType: "expense" | "deposit";
    timestamp: string;
}>;
export declare function getRecentTransactions(hostelId: string, limit?: number): Promise<({
    id: any;
    type: "expense";
    amount: any;
    description: any;
    date: any;
    user: {
        name: any;
    };
} | {
    id: any;
    type: "deposit";
    amount: any;
    description: any;
    date: any;
    user: {
        name: any;
    };
})[]>;
//# sourceMappingURL=calculations.d.ts.map