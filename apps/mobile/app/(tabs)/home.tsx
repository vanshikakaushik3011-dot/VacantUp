import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  MapPin,
  Search,
  CalendarCheck2,
  HeartPulse,
  Building2,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { useMobileAuth } from '../../context/AuthContext';
import { mobileDoctorApi, mobileHospitalApi, mobileAppointmentApi } from '../../services/api';
import { SUPPORTED_CITIES, POPULAR_SPECIALTIES } from '@vacantup/shared';

export default function HomeScreen() {
  const { user, selectedCity, setSelectedCity } = useMobileAuth();
  const router = useRouter();

  const [doctors, setDoctors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [upcomingAppointment, setUpcomingAppointment] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      const [docs, hosps] = await Promise.all([
        mobileDoctorApi.getAll({ city: selectedCity }),
        mobileHospitalApi.getAll({ city: selectedCity }),
      ]);
      setDoctors(docs.slice(0, 4));
      setHospitals(hosps.slice(0, 3));

      if (user) {
        const myApts = await mobileAppointmentApi.getMy('upcoming');
        if (myApts && myApts.length > 0) {
          setUpcomingAppointment(myApts[0]);
        } else {
          setUpcomingAppointment(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCity, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearchSubmit = () => {
    router.push({
      pathname: '/(tabs)/doctors',
      params: { query: searchQuery },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0284c7']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Bar */}
        <View style={styles.header}>
          <View>
            <View style={styles.brandRow}>
              <Text style={styles.brandVacant}>Vacant</Text>
              <Text style={styles.brandUp}>Up</Text>
            </View>
            <Text style={styles.tagline}>Skip the Queue. Find Available Doctors.</Text>
          </View>

          {/* City Selector Pill */}
          <View style={styles.citySelector}>
            <MapPin size={14} color="#0284c7" />
            <Text style={styles.cityName}>{selectedCity}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search doctors, specialties, or hospitals..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
        </View>

        {/* Upcoming Appointment Card (if any) */}
        {upcomingAppointment && (
          <View style={styles.upcomingCard}>
            <View style={styles.upcomingHeader}>
              <View style={styles.upcomingPill}>
                <CalendarCheck2 size={12} color="#0284c7" />
                <Text style={styles.upcomingPillText}>Upcoming Visit</Text>
              </View>
              <Text style={styles.bookingRefText}>{upcomingAppointment.bookingReference}</Text>
            </View>

            <Text style={styles.upcomingDoctorName}>{upcomingAppointment.doctorName}</Text>
            <Text style={styles.upcomingHospitalName}>{upcomingAppointment.hospitalName}</Text>

            <View style={styles.upcomingFooter}>
              <View style={styles.dateTimeRow}>
                <Clock size={13} color="#64748b" />
                <Text style={styles.dateTimeText}>
                  {upcomingAppointment.appointmentDate} at {upcomingAppointment.appointmentTime}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/appointments')}
                style={styles.viewPassButton}
              >
                <Text style={styles.viewPassText}>View Pass</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Hero Promo Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTextContainer}>
            <View style={styles.sparkleRow}>
              <Sparkles size={12} color="#bae6fd" />
              <Text style={styles.heroBadge}>Real-Time OPD</Text>
            </View>
            <Text style={styles.heroTitle}>Healthcare Without The Wait</Text>
            <Text style={styles.heroDesc}>Check instant slot availability & book in 2 taps.</Text>
          </View>
        </View>

        {/* Medical Specialties */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Medical Specialties</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/doctors')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtiesScroll}>
          {POPULAR_SPECIALTIES.map((spec) => (
            <TouchableOpacity
              key={spec.slug}
              style={styles.specialtyCard}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/doctors',
                  params: { specialty: spec.slug },
                })
              }
            >
              <View style={styles.specialtyIconBox}>
                <HeartPulse size={20} color="#0284c7" />
              </View>
              <Text style={styles.specialtyName} numberOfLines={1}>
                {spec.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Available Doctors in City */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Doctors in {selectedCity}</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/doctors')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.doctorsList}>
          {doctors.map((doc) => {
            const isAvail = doc.availabilityStatus === 'AVAILABLE' || doc.availabilityStatus === 'FEW_SLOTS_LEFT';
            return (
              <TouchableOpacity
                key={doc.id}
                style={styles.doctorCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/doctor/${doc.id}`)}
              >
                <Image
                  source={{ uri: doc.avatarUrl || `https://api.dicebear.com/7.x/initials/png?seed=${doc.name}` }}
                  style={styles.doctorAvatar}
                />
                <View style={styles.doctorInfo}>
                  <View style={styles.docNameRow}>
                    <Text style={styles.doctorName}>{doc.name}</Text>
                    {doc.isDemo && <Text style={styles.demoBadge}>Demo</Text>}
                  </View>
                  <Text style={styles.doctorSpecialty}>{doc.specialty}</Text>
                  <Text style={styles.doctorQualifications} numberOfLines={1}>
                    {doc.qualifications}
                  </Text>

                  <View style={styles.docBottomRow}>
                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: isAvail ? '#dcfce7' : '#fee2e2' },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: isAvail ? '#16a34a' : '#dc2626' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: isAvail ? '#166534' : '#991b1b' },
                        ]}
                      >
                        {doc.availabilityStatusLabel || 'Available'}
                      </Text>
                    </View>

                    <Text style={styles.feeText}>₹{doc.consultationFee}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Nearby Hospitals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Hospitals & Clinics</Text>
        </View>

        <View style={styles.hospitalsList}>
          {hospitals.map((hosp) => (
            <View key={hosp.id} style={styles.hospitalCard}>
              <Building2 size={24} color="#0284c7" />
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>{hosp.name}</Text>
                <Text style={styles.hospitalAddress} numberOfLines={1}>
                  {hosp.address}, {hosp.city}
                </Text>
                <Text style={styles.hospitalDoctorsCount}>
                  {hosp.doctorCount || 4} Doctors affiliated
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
  },
  brandVacant: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  brandUp: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0284c7',
  },
  tagline: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  cityName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369a1',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '500',
  },
  upcomingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
    marginBottom: 16,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  upcomingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  upcomingPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284c7',
  },
  bookingRefText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#0369a1',
  },
  upcomingDoctorName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  upcomingHospitalName: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  upcomingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  viewPassButton: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  viewPassText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  heroBanner: {
    backgroundColor: '#0284c7',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  heroTextContainer: {
    gap: 4,
  },
  sparkleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#bae6fd',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroDesc: {
    fontSize: 12,
    color: '#e0f2fe',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
  },
  specialtiesScroll: {
    marginBottom: 20,
  },
  specialtyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
    width: 96,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  specialtyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  specialtyName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  doctorsList: {
    gap: 12,
    marginBottom: 20,
  },
  doctorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  doctorInfo: {
    flex: 1,
  },
  docNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  demoBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  doctorSpecialty: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
    marginTop: 2,
  },
  doctorQualifications: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  docBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  feeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  hospitalsList: {
    gap: 10,
  },
  hospitalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  hospitalAddress: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  hospitalDoctorsCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284c7',
    marginTop: 2,
  },
});
