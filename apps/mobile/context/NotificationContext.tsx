import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mobileNotificationApi } from '../services/api';
import { useMobileAuth } from './AuthContext';

interface MobileNotificationContextType {
  notifications: any[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const MobileNotificationContext = createContext<MobileNotificationContextType | undefined>(undefined);

export const MobileNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useMobileAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      setLoading(true);
      const res = await mobileNotificationApi.getMy();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markRead = async (id: string) => {
    await mobileNotificationApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await mobileNotificationApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <MobileNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refresh,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </MobileNotificationContext.Provider>
  );
};

export const useMobileNotifications = () => {
  const context = useContext(MobileNotificationContext);
  if (!context) {
    throw new Error('useMobileNotifications must be used within MobileNotificationProvider');
  }
  return context;
};
