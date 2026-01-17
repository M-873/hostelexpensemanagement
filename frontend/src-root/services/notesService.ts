import { api } from './api';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'ACCOUNTS' | 'BAZAAR' | 'MAINTENANCE' | 'MEETING' | 'OTHER';
  isPublic: boolean;
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

export interface CreateNoteData {
  title: string;
  content: string;
  category?: 'GENERAL' | 'ACCOUNTS' | 'BAZAAR' | 'MAINTENANCE' | 'MEETING' | 'OTHER';
  isPublic?: boolean;
  hostelId?: string;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  category?: 'GENERAL' | 'ACCOUNTS' | 'BAZAAR' | 'MAINTENANCE' | 'MEETING' | 'OTHER';
  isPublic?: boolean;
}

export const notesService = {
  // Get all notes for a hostel
  getNotes: async (hostelId: string, category?: string, isPublic?: boolean): Promise<Note[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (isPublic !== undefined) params.append('isPublic', isPublic.toString());
    
    const response = await api.get(`/notes/hostel/${hostelId}?${params.toString()}`);
    return response.data;
  },

  // Get a specific note
  getNote: async (id: string): Promise<Note> => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  // Create a new note
  createNote: async (data: CreateNoteData): Promise<Note> => {
    const response = await api.post('/notes', data);
    return response.data;
  },

  // Update a note
  updateNote: async (id: string, data: UpdateNoteData): Promise<Note> => {
    const response = await api.put(`/notes/${id}`, data);
    return response.data;
  },

  // Delete a note
  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },
};