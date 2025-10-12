import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (payload: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'student' | 'coordinator';
    department?: string;
    studentId?: string;
    facultyId?: string;
    course?: string;
    branch?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok && data?.success) {
            setUser(data.user);
          } else {
            localStorage.removeItem('auth_token');
          }
        }
      } catch (e) {
        // ignore and treat as logged out
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data?.success && data?.token && data?.user) {
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup: AuthContextType['signup'] = async (payload) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        // Auto login after successful signup (use email instead of username)
        const loggedIn = await login(payload.email, payload.password);
        if (loggedIn) return { success: true };
        return { success: true, message: 'Account created. Please login.' };
      }
      return { success: false, message: data?.message || 'Signup failed' };
    } catch (err) {
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};