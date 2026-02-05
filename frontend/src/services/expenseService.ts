import { api } from './api';

export interface Expense {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    hostelId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

export const expenseService = {
    // Get all expenses for a hostel
    getExpenses: async (hostelId: string, params?: any): Promise<{ expenses: Expense[], pagination: any }> => {
        return api.get(`/expenses`, { ...params, hostelId });
    },

    // Create a new expense
    createExpense: async (data: any): Promise<Expense> => {
        const response = await api.post('/expenses', data);
        return response.expense;
    },

    // Update an expense
    updateExpense: async (id: string, data: any): Promise<Expense> => {
        const response = await api.put(`/expenses/${id}`, data);
        return response.expense;
    },

    // Delete an expense
    deleteExpense: async (id: string): Promise<any> => {
        return api.delete(`/expenses/${id}`);
    },

    // Get expense summary by category
    getCategorySummary: async (hostelId: string, params?: any): Promise<any> => {
        return api.get('/expenses/summary/category', { ...params, hostelId });
    }
};
