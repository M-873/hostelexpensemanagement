import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { noticeBoardService } from '../services/noticeBoardService';
import { io, Socket } from 'socket.io-client';
import { PageContainer } from '@/components/layout/PageContainer';

interface Notice {
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

const NoticeBoard: React.FC = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'NORMAL' as Notice['priority'],
    isActive: true,
  });

  const priorityColors = {
    LOW: 'bg-blue-100 border-blue-300',
    NORMAL: 'bg-green-100 border-green-300',
    HIGH: 'bg-yellow-100 border-yellow-300',
    URGENT: 'bg-red-100 border-red-300',
  };

  const priorityTextColors = {
    LOW: 'text-blue-800',
    NORMAL: 'text-green-800',
    HIGH: 'text-yellow-800',
    URGENT: 'text-red-800',
  };

  useEffect(() => {
    if (user?.hostelId) {
      fetchNotices();
      setupSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user?.hostelId]);

  const setupSocket = () => {
    if (!user?.token || !user?.hostelId) return;

    const newSocket = io('http://localhost:3001', {
      auth: {
        token: user.token,
      },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected, joining hostel room:', user.hostelId);
      newSocket.emit('join-hostel', user.hostelId);
    });

    newSocket.on('newNotice', (data) => {
      setNotices(prev => [data.notice, ...prev]);
      // Show notification
      if (Notification.permission === 'granted') {
        new Notification('New Notice', {
          body: data.message,
          icon: '/favicon.ico',
        });
      }
    });

    newSocket.on('updatedNotice', (data) => {
      setNotices(prev => prev.map(notice => 
        notice.id === data.notice.id ? data.notice : notice
      ));
    });

    newSocket.on('deletedNotice', (data) => {
      setNotices(prev => prev.filter(notice => notice.id !== data.noticeId));
    });

    setSocket(newSocket);
  };

  const fetchNotices = async () => {
    if (!user?.hostelId) return;

    try {
      setLoading(true);
      const data = await noticeBoardService.getNotices(user.hostelId);
      setNotices(data);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.hostelId) return;

    try {
      if (editingNotice) {
        const updated = await noticeBoardService.updateNotice(editingNotice.id, formData);
        setNotices(prev => prev.map(notice => 
          notice.id === updated.id ? updated : notice
        ));
      } else {
        const newNotice = await noticeBoardService.createNotice({
          ...formData,
          hostelId: user.hostelId,
        });
        setNotices(prev => [newNotice, ...prev]);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving notice:', error);
      alert('Failed to save notice. Please try again.');
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      priority: notice.priority,
      isActive: notice.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (noticeId: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;

    try {
      await noticeBoardService.deleteNotice(noticeId);
      setNotices(prev => prev.filter(notice => notice.id !== noticeId));
    } catch (error) {
      console.error('Error deleting notice:', error);
      alert('Failed to delete notice. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'NORMAL',
      isActive: true,
    });
    setEditingNotice(null);
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <PageContainer title="Notice Board">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Notice Board">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Notice Board</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Notice
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingNotice ? 'Edit Notice' : 'Create New Notice'}
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
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Notice['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.isActive.toString()}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  {editingNotice ? 'Update' : 'Create'}
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
          {notices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No notices yet.</p>
              <p>Be the first to create a notice!</p>
            </div>
          ) : (
            notices.map((notice) => (
              <div
                key={notice.id}
                className={`border-l-4 rounded-lg p-4 ${priorityColors[notice.priority]} ${!notice.isActive ? 'opacity-60' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {notice.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityTextColors[notice.priority]}`}>
                        {notice.priority}
                      </span>
                      <span>By {notice.createdByUser.name}</span>
                      <span>{formatDate(notice.createdAt)}</span>
                      {!notice.isActive && (
                        <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(notice)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default NoticeBoard;
