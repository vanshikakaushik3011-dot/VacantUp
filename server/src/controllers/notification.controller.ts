import { Request, Response } from 'express';
import { getUserNotifications, markAsRead, markAllAsRead } from '../services/notification.service';

export async function getMyNotifications(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const notifications = getUserNotifications(req.user.id);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function markNotificationRead(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { id } = req.params;
    const ok = markAsRead(id, req.user.id);
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function markAllNotificationsRead(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const count = markAllAsRead(req.user.id);
    return res.json({ success: true, message: `${count} notifications marked as read` });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
