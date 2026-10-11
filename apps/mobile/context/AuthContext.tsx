import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { mobileAuthApi } from '../services/api';

interface MobileAuthContextType {
  user: any | null;
  loading: boolean;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  hasSeenOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const MobileAuthContext = createContext<MobileAuthContextType | undefined>(undefined);

export const MobileAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('Karnal');
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const seen = await storage.getOnboardingCompleted();
        setHasSeenOnboarding(seen);

        const token = await storage.getToken();
        if (token) {
          const userData = await mobileAuthApi.getMe();
          setUser(userData);
        }
      } catch (err) {
        await storage.removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const completeOnboarding = async () => {
    await storage.setOnboardingCompleted(true);
    setHasSeenOnboarding(true);
  };

  const login = async (email: string, password: string) => {
    const res = await mobileAuthApi.login({ email, password });
    await storage.setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: { name: string; email: string; password: string; role?: string; phone?: string }) => {
    const res = await mobileAuthApi.register(data);
    await storage.setToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    await storage.removeToken();
    setUser(null);
  };

  return (
    <MobileAuthContext.Provider
      value={{
        user,
        loading,
        selectedCity,
        setSelectedCity,
        hasSeenOnboarding,
        completeOnboarding,
        login,
        register,
        logout,
      }}
    >
      {children}
    </MobileAuthContext.Provider>
  );
};

export const useMobileAuth = () => {
  const context = useContext(MobileAuthContext);
  if (!context) {
    throw new Error('useMobileAuth must be used within MobileAuthProvider');
  }
  return context;
};
