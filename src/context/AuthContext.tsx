import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';
import type { User } from '../types/user';

interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  role: 'guest' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  uid: apiUser.id,
  displayName: apiUser.fullName,
  email: apiUser.email,
  role: apiUser.role,
  isAdmin: apiUser.role === 'admin',
  createdAt: new Date().toISOString(),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest<{ user: ApiUser }>('/auth/me')
      .then(({ user: apiUser }) => { if (active) setUser(toUser(apiUser)); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const result = await apiRequest<{ user: ApiUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName: name }),
    });
    setUser(toUser(result.user));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<{ user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(toUser(result.user));
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest<void>('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, isLoading, isAdmin: user?.role === 'admin', signUp, login, logout }), [user, isLoading, signUp, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
