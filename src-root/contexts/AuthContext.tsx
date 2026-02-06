import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, Hostel, MembershipRequest } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  selectedHostel: Hostel | null;
  setSelectedHostel: (hostel: Hostel | null) => void;
  hasSelectedHostel: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for initial testing
const demoUsers: Record<string, { password: string; user: User }> = {
  'admin@hostel.com': {
    password: 'admin123',
    user: {
      id: '1',
      name: 'Admin User',
      email: 'admin@hostel.com',
      role: 'admin',
      spaceId: 'space-1'
    }
  },
  'user@hostel.com': {
    password: 'user123',
    user: {
      id: '2',
      name: 'Regular User',
      email: 'user@hostel.com',
      role: 'user',
      spaceId: 'space-1'
    }
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Demo authentication - will be replaced with Cloud auth
    const demoUser = demoUsers[email];
    if (demoUser && demoUser.password === password) {
      setUser({ ...demoUser.user, role });
      return true;
    }
    // For demo, allow any login with selected role
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      role,
      spaceId: 'space-1'
    });
    return true;
  };

  const logout = () => {
    setUser(null);
    setSelectedHostel(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      isAdmin: user?.role === 'admin',
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
