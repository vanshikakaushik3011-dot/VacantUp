import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, Building2, AlertCircle, RefreshCw } from 'lucide-react-native';
import { mobileAppointmentApi } from '../../services/api';
import { useMobileAuth } from '../../context/AuthContext';
import { useMobileNotifications } from '../../context/NotificationContext';

export default function AppointmentsScreen() {
  const { user } = useMobileAuth();
  const { refresh: refreshNotifs } = useMobileNotifications();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancellation state
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [targetAppointment, setTargetAppointment] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await mobileAppointmentApi.getMy(activeTab);
      setAppointments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user, activeTab]);

  const handleCancelConfirm = async () => {
    if (!targetAppointment) return;
    try {
      setCancelling(true);
      await mobileAppointmentApi.cancel(targetAppointment.id, cancelReason);
      setCancelModalVisible(false);
      setTargetAppointment(null);
      setCancelReason('');
      fetchAppointments();
      refreshNotifs();
      Alert.alert('Appointment Cancelled', 'Your consultation has been successfully cancelled.');
    } catch (err: any) {
      Alert.alert('Cancellation Error', err.response?.data?.error || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <AlertCircle size={44} color="#94a3b8" />
        <Text style={styles.authTitle}>Sign In Required</Text>
        <Text style={styles.authSubtitle}>
          Sign in to view your real-time booked OPD appointments and references.
        </Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.loginBtnText}>Sign In Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Segmented Filter */}
      <View style={styles.segmentedControl}>
        {(['upcoming', 'past', 'cancelled'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.segmentBtn, activeTab === tab && styles.segmentBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.segmentBtnText, activeTab === tab && styles.segmentBtnTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Appointment list */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.centered}>
          <Calendar size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No {activeTab} appointments</Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'upcoming'
              ? 'Find a verified doctor and reserve your OPD slot in seconds.'
              : `You have no ${activeTab} consultation history.`}
          </Text>
          {activeTab === 'upcoming' && (
            <TouchableOpacity style={styles.bookNowBtn} onPress={() => router.push('/(tabs)/doctors')}>
              <Text style={styles.bookNowBtnText}>Find Available Doctors</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.appointmentCard}>
              <View style={styles.cardHeader}>
                <View style={styles.refPill}>
                  <Text style={styles.refText}>{item.bookingReference}</Text>
                </View>
                <Text
                  style={[
                    styles.statusBadge,
                    item.status === 'CONFIRMED'
                      ? styles.statusConfirmed
                      : item.status === 'CANCELLED'
                      ? styles.statusCancelled
                      : styles.statusCompleted,
                  ]}
                >
                  {item.status}
                </Text>
              </View>

              <Text style={styles.doctorName}>{item.doctorName}</Text>
              <Text style={styles.specialty}>{item.doctorSpecialty}</Text>

              <View style={styles.detailRow}>
                <Building2 size={13} color="#64748b" />
                <Text style={styles.detailText} numberOfLines={1}>
                  {item.hospitalName}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Calendar size={13} color="#0284c7" />
                <Text style={styles.dateTimeText}>
                  {item.appointmentDate} at {item.appointmentTime}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.feeText}>Fee: ₹{item.consultationFee}</Text>

                {item.status === 'CONFIRMED' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => {
                        setTargetAppointment(item);
                        setCancelModalVisible(true);
                      }}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}

      {/* Cancel Modal */}
      <Modal visible={cancelModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Cancel Consultation</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to cancel your appointment with {targetAppointment?.doctorName}?
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Reason for cancellation (optional)..."
              placeholderTextColor="#94a3b8"
              value={cancelReason}
              onChangeText={setCancelReason}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Keep Slot</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                disabled={cancelling}
                onPress={handleCancelConfirm}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>Confirm Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#0284c7',
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  segmentBtnTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  refPill: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  refText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#0284c7',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    textTransform: 'uppercase',
  },
  statusConfirmed: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusCancelled: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  statusCompleted: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  specialty: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284c7',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  detailText: {
    fontSize: 11,
    color: '#64748b',
  },
  dateTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  feeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cancelBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
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
    marginBottom: 16,
  },
  bookNowBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  bookNowBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  authTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 12,
  },
  authSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  loginBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  loginBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 380,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 14,
    lineHeight: 18,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 10,
    fontSize: 12,
    color: '#0f172a',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
