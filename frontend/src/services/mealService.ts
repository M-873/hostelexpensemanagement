import { api } from './api';

export interface Meal {
    id: string;
    date: string;
    count: number;
    userId: string;
    hostelId: string;
    user?: {
        id: string;
        name: string;
    };
}

export const mealService = {
    getMeals: async (hostelId: string, date?: string): Promise<{ meals: Meal[] }> => {
        return api.get('/meals', { hostelId, date });
    },

    upsertMeal: async (data: { date: string, count: number, userId: string, hostelId: string }): Promise<{ meal: Meal }> => {
        return api.post('/meals/upsert', data);
    }
};
