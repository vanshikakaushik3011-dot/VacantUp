import { inMemStore, DbNotification } from './store.service';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_RESCHEDULED' | 'SCHEDULE_CHANGED' | 'SYSTEM';
  relatedAppointmentId?: string;
}

export function createNotification(params: CreateNotificationParams): DbNotification {
  const notif: DbNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: params.userId,
    title: params.title,
    message: params.message,
    type: params.type || 'SYSTEM',
    isRead: false,
    relatedAppointmentId: params.relatedAppointmentId || null,
    createdAt: new Date().toISOString(),
  };

  inMemStore.notifications.unshift(notif);
  return notif;
}

export function getUserNotifications(userId: string): DbNotification[] {
  return inMemStore.notifications.filter((n) => n.userId === userId);
}

export function markAsRead(notificationId: string, userId: string): boolean {
  const notif = inMemStore.notifications.find((n) => n.id === notificationId && n.userId === userId);
  if (notif) {
    notif.isRead = true;
    return true;
  }
  return false;
}

export function markAllAsRead(userId: string): number {
  let count = 0;
  inMemStore.notifications.forEach((n) => {
    if (n.userId === userId && !n.isRead) {
      n.isRead = true;
      count++;
    }
  });
  return count;
}
