import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSummary } from '@vacantup/shared';
import { authApi } from '../services/api';

interface AuthContextType {
  user: UserSummary | null;
  loading: boolean;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: string; phone?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('Karnal');

  useEffect(() => {
    const token = localStorage.getItem('vacantup_token');
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .getMe()
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        localStorage.removeItem('vacantup_token');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('vacantup_token', res.token);
    setUser(res.user);
  };

  const register = async (data: { name: string; email: string; password: string; role?: string; phone?: string }) => {
    const res = await authApi.register(data);
    localStorage.setItem('vacantup_token', res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('vacantup_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        selectedCity,
        setSelectedCity,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
