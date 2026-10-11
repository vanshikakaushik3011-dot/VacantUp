import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Calendar,
  Clock,
  Building2,
  CheckCircle,
  Briefcase,
  MapPin,
  CreditCard,
  CheckCircle2,
} from 'lucide-react-native';
import { mobileDoctorApi, mobileAppointmentApi } from '../../services/api';
import { useMobileAuth } from '../../context/AuthContext';
import { useMobileNotifications } from '../../context/NotificationContext';

export default function DoctorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useMobileAuth();
  const { refresh: refreshNotifs } = useMobileNotifications();

  const [doctor, setDoctor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Date and slot states
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(tomorrowStr);
  const [availability, setAvailability] = useState<any | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Booking Modal
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [patientNotes, setPatientNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    mobileDoctorApi
      .getById(id)
      .then((data) => setDoctor(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    mobileDoctorApi
      .getAvailability(id, selectedDate)
      .then((data) => setAvailability(data))
      .catch((err) => console.error(err))
      .finally(() => setSlotsLoading(false));
  }, [id, selectedDate]);

  // Quick date generator
  const getQuickDates = () => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const str = d.toISOString().split('T')[0];
      const label =
        i === 0
          ? 'Today'
          : i === 1
          ? 'Tomorrow'
          : d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      dates.push({ date: str, label });
    }
    return dates;
  };

  const handleBookPress = () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to confirm this doctor consultation slot.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    setBookingModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!doctor || !selectedSlot) return;
    const hospital = doctor.hospitals?.[0] || { id: 'default', name: 'General Clinic' };

    try {
      setBookingLoading(true);
      const res = await mobileAppointmentApi.create({
        doctorId: doctor.id,
        hospitalId: hospital.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        notes: patientNotes,
      });

      setConfirmedBooking(res);
      refreshNotifs();
    } catch (err: any) {
      Alert.alert('Booking Error', err.response?.data?.error || 'Failed to book slot.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Loading doctor schedule...</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Doctor not found</Text>
      </View>
    );
  }

  const quickDates = getQuickDates();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Doctor Header Card */}
      <View style={styles.doctorHeaderCard}>
        <Image
          source={{ uri: doctor.avatarUrl || `https://api.dicebear.com/7.x/initials/png?seed=${doctor.name}` }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>
          <Text style={styles.qualifications}>{doctor.qualifications}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Briefcase size={12} color="#64748b" />
              <Text style={styles.metaText}>{doctor.experienceYears} yrs exp</Text>
            </View>
            <View style={styles.metaItem}>
              <MapPin size={12} color="#64748b" />
              <Text style={styles.metaText}>{doctor.city}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Hospital Affiliation & Fee */}
      <View style={styles.infoBox}>
        <View style={styles.hospitalRow}>
          <Building2 size={16} color="#0284c7" />
          <View style={{ flex: 1 }}>
            <Text style={styles.hospitalName}>{doctor.hospitals?.[0]?.name || 'Hospital Clinic'}</Text>
            <Text style={styles.hospitalAddress}>{doctor.hospitals?.[0]?.address || doctor.city}</Text>
          </View>
        </View>

        <View style={styles.feeRow}>
          <CreditCard size={15} color="#0284c7" />
          <Text style={styles.feeLabel}>OPD Consultation Fee</Text>
          <Text style={styles.feeValue}>₹{doctor.consultationFee}</Text>
        </View>
      </View>

      {/* Date Picker Selector */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Select Consultation Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datePillsScroll}>
          {quickDates.map((item) => (
            <TouchableOpacity
              key={item.date}
              style={[
                styles.datePill,
                selectedDate === item.date && styles.datePillActive,
              ]}
              onPress={() => setSelectedDate(item.date)}
            >
              <Text
                style={[
                  styles.datePillText,
                  selectedDate === item.date && styles.datePillTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Live Slot Grid */}
        <Text style={styles.slotSectionTitle}>Available Slots</Text>
        {slotsLoading ? (
          <View style={styles.slotsLoadingBox}>
            <ActivityIndicator size="small" color="#0284c7" />
            <Text style={styles.slotsLoadingText}>Checking live OPD vacancy...</Text>
          </View>
        ) : availability ? (
          <View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabelText}>{availability.statusLabel}</Text>
              <Text style={styles.freeSlotsCount}>
                {availability.availableSlots} of {availability.totalSlots} slots free
              </Text>
            </View>

            {availability.slots.length === 0 ? (
              <Text style={styles.noSlotsText}>No slots available on this date.</Text>
            ) : (
              <View style={styles.slotsGrid}>
                {availability.slots.map((slot: any) => {
                  const isSelected = selectedSlot === slot.time;
                  return (
                    <TouchableOpacity
                      key={slot.time}
                      disabled={!slot.isAvailable}
                      style={[
                        styles.slotBtn,
                        !slot.isAvailable && styles.slotBtnDisabled,
                        isSelected && styles.slotBtnSelected,
                      ]}
                      onPress={() => setSelectedSlot(slot.time)}
                    >
                      <Text
                        style={[
                          styles.slotBtnText,
                          !slot.isAvailable && styles.slotBtnTextDisabled,
                          isSelected && styles.slotBtnTextSelected,
                        ]}
                      >
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        ) : null}
      </View>

      {/* Book Slot CTA */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomFeeLabel}>Consultation Fee</Text>
          <Text style={styles.bottomFeeValue}>₹{doctor.consultationFee}</Text>
        </View>

        <TouchableOpacity
          disabled={!selectedSlot}
          style={[styles.bookBtn, !selectedSlot && styles.bookBtnDisabled]}
          onPress={handleBookPress}
        >
          <Text style={styles.bookBtnText}>
            {selectedSlot ? `Book ${selectedSlot}` : 'Select A Slot'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Booking Confirmation Modal */}
      <Modal visible={bookingModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {confirmedBooking ? (
              <View style={styles.successBox}>
                <CheckCircle2 size={54} color="#16a34a" />
                <Text style={styles.successTitle}>Booking Confirmed!</Text>
                <Text style={styles.successRef}>
                  Ref: {confirmedBooking.bookingReference}
                </Text>

                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLine}>
                    Doctor: <Text style={styles.bold}>{doctor.name}</Text>
                  </Text>
                  <Text style={styles.summaryLine}>
                    Date: <Text style={styles.bold}>{confirmedBooking.appointmentDate}</Text>
                  </Text>
                  <Text style={styles.summaryLine}>
                    Time: <Text style={styles.bold}>{confirmedBooking.appointmentTime}</Text>
                  </Text>
                  <Text style={styles.summaryLine}>
                    Fee: <Text style={styles.bold}>₹{confirmedBooking.consultationFee}</Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => {
                    setBookingModalVisible(false);
                    setConfirmedBooking(null);
                    router.push('/(tabs)/appointments');
                  }}
                >
                  <Text style={styles.doneBtnText}>View in My Appointments</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.modalHeaderTitle}>Confirm Consultation</Text>
                <Text style={styles.modalDoctorText}>{doctor.name} ({doctor.specialty})</Text>
                <Text style={styles.modalSlotText}>
                  {selectedDate} at {selectedSlot}
                </Text>

                <TextInput
                  style={styles.notesInput}
                  placeholder="Reason for visit / symptoms (optional)..."
                  placeholderTextColor="#94a3b8"
                  value={patientNotes}
                  onChangeText={setPatientNotes}
                  multiline
                />

                <View style={styles.modalActionButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setBookingModalVisible(false)}
                  >
                    <Text style={styles.modalCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalConfirmBtn}
                    disabled={bookingLoading}
                    onPress={handleConfirmBooking}
                  >
                    {bookingLoading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.modalConfirmBtnText}>Confirm Booking</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  doctorHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  specialty: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
  },
  qualifications: {
    fontSize: 11,
    color: '#64748b',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hospitalName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  hospitalAddress: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 6,
  },
  feeLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  feeValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
  },
  datePillsScroll: {
    marginBottom: 16,
  },
  datePill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  datePillActive: {
    backgroundColor: '#0284c7',
  },
  datePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  datePillTextActive: {
    color: '#ffffff',
  },
  slotSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  freeSlotsCount: {
    fontSize: 11,
    color: '#64748b',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotBtn: {
    width: '31%',
    backgroundColor: '#f0f9ff',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  slotBtnDisabled: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  slotBtnSelected: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  slotBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369a1',
  },
  slotBtnTextDisabled: {
    color: '#94a3b8',
  },
  slotBtnTextSelected: {
    color: '#ffffff',
  },
  noSlotsText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 16,
  },
  slotsLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  slotsLoadingText: {
    fontSize: 12,
    color: '#64748b',
  },
  bottomBar: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bottomFeeLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  bottomFeeValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  bookBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  bookBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  bookBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 380,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  modalDoctorText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284c7',
  },
  modalSlotText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  notesInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 10,
    fontSize: 12,
    height: 60,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  modalActionButtons: {
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
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 10,
  },
  successRef: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#0284c7',
    marginTop: 2,
    marginBottom: 12,
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    width: '100%',
    gap: 4,
    marginBottom: 16,
  },
  summaryLine: {
    fontSize: 12,
    color: '#64748b',
  },
  bold: {
    fontWeight: '700',
    color: '#0f172a',
  },
  doneBtn: {
    backgroundColor: '#0284c7',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
