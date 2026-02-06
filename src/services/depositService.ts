import { api } from './api';

export interface Deposit {
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

export const depositService = {
    // Get all deposits for a hostel
    getDeposits: async (hostelId: string, params?: any): Promise<{ deposits: Deposit[], pagination: any }> => {
        return api.get(`/deposits`, { ...params, hostelId });
    },

    // Create a new deposit
    createDeposit: async (data: any): Promise<Deposit> => {
        const response = await api.post('/deposits', data);
        return response.deposit;
    },

    // Update a deposit
    updateDeposit: async (id: string, data: any): Promise<Deposit> => {
        const response = await api.put(`/deposits/${id}`, data);
        return response.deposit;
    },

    // Delete a deposit
    deleteDeposit: async (id: string): Promise<any> => {
        return api.delete(`/deposits/${id}`);
    },

    // Get deposit summary by category
    getCategorySummary: async (hostelId: string, params?: any): Promise<any> => {
        return api.get('/deposits/summary/category', { ...params, hostelId });
    }
};
