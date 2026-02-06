import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { notesService } from '../services/notesService';
import { PageContainer } from '@/components/layout/PageContainer';

interface Note {
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

const Notes: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL' as Note['category'],
    isPublic: true,
  });

  const categoryColors = {
    GENERAL: 'bg-gray-100 text-gray-800',
    ACCOUNTS: 'bg-blue-100 text-blue-800',
    BAZAAR: 'bg-green-100 text-green-800',
    MAINTENANCE: 'bg-yellow-100 text-yellow-800',
    MEETING: 'bg-purple-100 text-purple-800',
    OTHER: 'bg-pink-100 text-pink-800',
  };

  const categoryLabels = {
    GENERAL: 'General',
    ACCOUNTS: 'Accounts',
    BAZAAR: 'Bazaar',
    MAINTENANCE: 'Maintenance',
    MEETING: 'Meeting',
    OTHER: 'Other',
  };

  useEffect(() => {
    if (user?.hostelId) {
      fetchNotes();
    }
  }, [user?.hostelId, selectedCategory, showPublicOnly]);

  const fetchNotes = async () => {
    if (!user?.hostelId) return;

    try {
      setLoading(true);
      const category = selectedCategory === 'ALL' ? undefined : selectedCategory;
      const data = await notesService.getNotes(user.hostelId, category, showPublicOnly);
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.hostelId) return;

    try {
      if (editingNote) {
        const updated = await notesService.updateNote(editingNote.id, formData);
        setNotes(prev => prev.map(note => 
          note.id === updated.id ? updated : note
        ));
      } else {
        const newNote = await notesService.createNote({
          ...formData,
          hostelId: user.hostelId,
        });
        setNotes(prev => [newNote, ...prev]);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const handleEdit = (note: Note) => {
    // Only allow editing your own notes
    if (note.createdBy !== user?.id) {
      alert('You can only edit your own notes.');
      return;
    }

    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      isPublic: note.isPublic,
    });
    setShowForm(true);
  };

  const handleDelete = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    // Only allow deleting your own notes
    if (note.createdBy !== user?.id) {
      alert('You can only delete your own notes.');
      return;
    }

    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesService.deleteNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'GENERAL',
      isPublic: true,
    });
    setEditingNote(null);
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredNotes = notes.filter(note => {
    if (selectedCategory !== 'ALL' && note.category !== selectedCategory) return false;
    if (showPublicOnly && !note.isPublic) return false;
    return true;
  });

  if (loading) {
    return (
      <PageContainer title="Notes">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Notes">
      <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Notes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Note
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Categories</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="publicOnly"
              checked={showPublicOnly}
              onChange={(e) => setShowPublicOnly(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="publicOnly" className="text-sm text-gray-700">
              Public notes only
            </label>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingNote ? 'Edit Note' : 'Create New Note'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Note['category'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility
                </label>
                <select
                  value={formData.isPublic.toString()}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">Public</option>
                  <option value="false">Private</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                {editingNote ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No notes found.</p>
            <p>Try adjusting your filters or create a new note!</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {note.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[note.category]}`}>
                      {categoryLabels[note.category]}
                    </span>
                    {!note.isPublic && (
                      <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                        Private
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>By {note.createdByUser.name}</span>
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
                </div>
                {note.createdBy === user?.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(note)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))
        )}
      </div>
      </div>
    </PageContainer>
  );
};

export default Notes;
