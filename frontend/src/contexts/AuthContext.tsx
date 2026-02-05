import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole, Hostel } from '@/types';
import { api } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  googleLogin: (credential: string, role?: UserRole) => Promise<boolean>;
  updateProfile: (name: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  selectedHostel: Hostel | null;
  setSelectedHostel: (hostel: Hostel | null) => void;
  hasSelectedHostel: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const data = await api.post('/auth/login', { email, password, role } as any);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      alert(error instanceof Error ? error.message : 'Invalid credentials');
      return false;
    }
  };

  const googleLogin = async (credential: string, role?: UserRole): Promise<boolean> => {
    try {
      const data = await api.googleLogin(credential, role);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      return true;
    } catch (error) {
      console.error('Google Login error:', error);
      alert(error instanceof Error ? error.message : 'Google Login failed');
      return false;
    }
  };

  const updateProfile = async (name: string): Promise<boolean> => {
    try {
      const data = await api.put('/auth/update-profile', { name } as any);

      const updatedUser = { ...user, name: data.user.name } as User;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      alert(error instanceof Error ? error.message : 'Failed to update profile');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSelectedHostel(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      googleLogin,
      updateProfile,
      logout,
      isAdmin: user?.role === 'ADMIN',
      selectedHostel,
      setSelectedHostel,
      hasSelectedHostel: !!selectedHostel
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
