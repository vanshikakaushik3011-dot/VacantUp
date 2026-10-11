import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Search, MapPin, Filter, HeartPulse } from 'lucide-react-native';
import { mobileDoctorApi } from '../../services/api';
import { useMobileAuth } from '../../context/AuthContext';
import { SUPPORTED_CITIES, POPULAR_SPECIALTIES } from '@vacantup/shared';

export default function DoctorsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { selectedCity, setSelectedCity } = useMobileAuth();

  const [query, setQuery] = useState((params.query as string) || '');
  const [specialty, setSpecialty] = useState((params.specialty as string) || '');
  const [city, setCity] = useState(selectedCity || 'Karnal');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await mobileDoctorApi.getAll({
        city,
        specialty: specialty || undefined,
        query: query || undefined,
      });
      setDoctors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [city, specialty]);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search size={18} color="#94a3b8" />
        <TextInput
          placeholder="Search by doctor name or specialty..."
          placeholderTextColor="#94a3b8"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={fetchDoctors}
          returnKeyType="search"
        />
      </View>

      {/* Filter Row */}
      <View style={styles.filtersSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={SUPPORTED_CITIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.cityPillsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.cityPill,
                city === item && styles.cityPillActive,
              ]}
              onPress={() => {
                setCity(item);
                setSelectedCity(item);
              }}
            >
              <Text style={[styles.cityPillText, city === item && styles.cityPillTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Specialty Filter Scroll */}
      <View style={styles.specialtiesRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ name: 'All Specialties', slug: '' }, ...POPULAR_SPECIALTIES]}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={styles.specPillsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.specPill,
                specialty === item.slug && styles.specPillActive,
              ]}
              onPress={() => setSpecialty(item.slug)}
            >
              <Text style={[styles.specPillText, specialty === item.slug && styles.specPillTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Doctors List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Fetching available doctors...</Text>
        </View>
      ) : doctors.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No doctors found</Text>
          <Text style={styles.emptySubtitle}>Try changing your city or specialty filter</Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isAvail = item.availabilityStatus === 'AVAILABLE' || item.availabilityStatus === 'FEW_SLOTS_LEFT';
            return (
              <TouchableOpacity
                style={styles.doctorCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/doctor/${item.id}`)}
              >
                <Image
                  source={{ uri: item.avatarUrl || `https://api.dicebear.com/7.x/initials/png?seed=${item.name}` }}
                  style={styles.doctorAvatar}
                />
                <View style={styles.doctorInfo}>
                  <View style={styles.docHeaderRow}>
                    <Text style={styles.docName}>{item.name}</Text>
                    {item.isDemo && <Text style={styles.demoBadge}>Demo</Text>}
                  </View>
                  <Text style={styles.docSpecialty}>{item.specialty}</Text>
                  <Text style={styles.docQualifications} numberOfLines={1}>
                    {item.qualifications}
                  </Text>
                  <Text style={styles.docExperience}>
                    {item.experienceYears} yrs exp • {item.city}
                  </Text>

                  <View style={styles.cardFooter}>
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
                        {item.availabilityStatusLabel || 'Available'}
                      </Text>
                    </View>

                    <Text style={styles.feeText}>₹{item.consultationFee}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  filtersSection: {
    marginTop: 10,
  },
  cityPillsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  cityPill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cityPillActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  cityPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  cityPillTextActive: {
    color: '#ffffff',
  },
  specialtiesRow: {
    marginTop: 8,
    marginBottom: 8,
  },
  specPillsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  specPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specPillActive: {
    backgroundColor: '#0d9488',
  },
  specPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  specPillTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
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
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  doctorInfo: {
    flex: 1,
  },
  docHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docName: {
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
  },
  docSpecialty: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
    marginTop: 1,
  },
  docQualifications: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  docExperience: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  cardFooter: {
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
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
});
