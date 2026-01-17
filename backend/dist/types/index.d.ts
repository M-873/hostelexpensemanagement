export interface CreateHostelRequest {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
}
export interface CreateHostelResponse {
    id: string;
    registrationNumber: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    createdAt: Date;
}
export interface JoinHostelRequest {
    registrationNumber: string;
}
export interface CreateExpenseRequest {
    amount: number;
    description: string;
    category: string;
    date: string;
    hostelId: string;
}
export interface CreateDepositRequest {
    amount: number;
    description: string;
    date: string;
    hostelId: string;
}
export interface DailyCalculationResponse {
    date: string;
    totalExpenses: number;
    totalDeposits: number;
    netBalance: number;
}
export interface DashboardData {
    currentBalance: number;
    totalExpenses: number;
    totalDeposits: number;
    recentTransactions: Array<{
        id: string;
        type: 'expense' | 'deposit';
        amount: number;
        description: string;
        date: string;
        user: {
            name: string;
        };
    }>;
    dailyCalculations: DailyCalculationResponse[];
}
export interface AuthRequest {
    email: string;
    password: string;
    role: 'admin' | 'user';
}
export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        hostelId?: string;
    };
}
export interface UserResponse {
    id: string;
    email: string;
    name: string;
    role: string;
    hostelId?: string;
    hostel?: {
        id: string;
        name: string;
        registrationNumber: string;
    };
}
//# sourceMappingURL=index.d.ts.map