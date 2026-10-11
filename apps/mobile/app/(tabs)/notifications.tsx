import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Bell, CheckCheck } from 'lucide-react-native';
import { useMobileNotifications } from '../../context/NotificationContext';
import { useMobileAuth } from '../../context/AuthContext';

export default function NotificationsScreen() {
  const { user } = useMobileAuth();
  const { notifications, loading, markRead, markAllRead, unreadCount } = useMobileNotifications();

  if (!user) {
    return (
      <View style={styles.centered}>
        <Bell size={40} color="#94a3b8" />
        <Text style={styles.emptyTitle}>Sign in to view notifications</Text>
        <Text style={styles.emptySubtitle}>You'll see booking confirmations and doctor schedule alerts here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <Text style={styles.headerCount}>{notifications.length} Alerts</Text>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={() => markAllRead()}>
            <CheckCheck size={14} color="#0284c7" />
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centered}>
          <Bell size={44} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtitle}>Appointment updates and reminders will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
              activeOpacity={0.7}
              onPress={() => {
                if (!item.isRead) markRead(item.id);
              }}
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.timeText}>
                  {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <Text style={styles.notifMessage}>{item.message}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  unreadCard: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  timeText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  notifMessage: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
});
