import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import client from '../api/client';

export interface User {
  id: string;
  email: string;
  displayName: string;
  houseId: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('homed_token');
    if (token) {
      client
        .get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem('homed_token'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('homed_token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('homed_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
