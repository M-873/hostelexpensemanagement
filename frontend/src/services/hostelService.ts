import { api } from './api';
import { Hostel, User } from '@/types';

export interface MembershipRequest {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    hostelId: string;
    hostelName: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
}

export const hostelService = {
    // Search for hostels
    searchHostels: async (query: string): Promise<Hostel[]> => {
        const response = await api.get(`/hostels/search/${query}`);
        return response.hostels;
    },

    // Create a new hostel
    createHostel: async (data: {
        name: string;
        address?: string;
        phone?: string;
        email?: string;
    }): Promise<Hostel> => {
        const response = await api.post('/hostels', data as any);
        return response.hostel;
    },

    // Join a hostel
    joinHostel: async (hostelId: string, message?: string): Promise<any> => {
        const response = await api.post('/hostels/membership-request', { hostelId, message } as any);
        return response;
    },

    // Get hostel members
    getHostelMembers: async (hostelId: string): Promise<User[]> => {
        const response = await api.get(`/hostels/${hostelId}/members`);
        return response.members;
    }
};
