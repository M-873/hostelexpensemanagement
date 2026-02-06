import { api } from './api';

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isActive: boolean;
  createdBy: string;
  hostelId: string;
  createdAt: string;
  updatedAt: string;
  createdByUser: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateNoticeData {
  title: string;
  content: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isActive?: boolean;
  hostelId: string;
}

export interface UpdateNoticeData {
  title?: string;
  content?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isActive?: boolean;
}

export const noticeBoardService = {
  // Get all notices for a hostel
  getNotices: async (hostelId: string, priority?: string, isActive?: boolean): Promise<Notice[]> => {
    const params = new URLSearchParams();
    if (priority) params.append('priority', priority);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    
    const response = await api.get(`/notices/hostel/${hostelId}?${params.toString()}`);
    return response.data;
  },

  // Get a specific notice
  getNotice: async (id: string): Promise<Notice> => {
    const response = await api.get(`/notices/${id}`);
    return response.data;
  },

  // Create a new notice
  createNotice: async (data: CreateNoticeData): Promise<Notice> => {
    const response = await api.post('/notices', data);
    return response.data;
  },

  // Update a notice
  updateNotice: async (id: string, data: UpdateNoticeData): Promise<Notice> => {
    const response = await api.put(`/notices/${id}`, data);
    return response.data;
  },

  // Delete a notice
  deleteNotice: async (id: string): Promise<void> => {
    await api.delete(`/notices/${id}`);
  },
};