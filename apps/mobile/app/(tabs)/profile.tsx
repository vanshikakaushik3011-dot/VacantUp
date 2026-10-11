import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Shield,
  LogIn,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { useMobileAuth } from '../../context/AuthContext';
import { SUPPORTED_CITIES } from '@vacantup/shared';

export default function ProfileScreen() {
  const { user, logout, login, selectedCity, setSelectedCity } = useMobileAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of VacantUp?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleQuickDemoSwitch = async (email: string, pass: string) => {
    try {
      await login(email, pass);
      Alert.alert('Logged In', `Switched account to ${email}`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to switch demo account');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      {user ? (
        <View style={styles.userCard}>
          <Image
            source={{ uri: user.avatarUrl || `https://api.dicebear.com/7.x/initials/png?seed=${user.name}` }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userRoleBadge}>{user.role}</Text>

            <View style={styles.contactRow}>
              <Mail size={12} color="#64748b" />
              <Text style={styles.contactText}>{user.email}</Text>
            </View>
            {user.phone && (
              <View style={styles.contactRow}>
                <Phone size={12} color="#64748b" />
                <Text style={styles.contactText}>{user.phone}</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.guestCard}>
          <User size={36} color="#0284c7" />
          <Text style={styles.guestTitle}>Welcome to VacantUp</Text>
          <Text style={styles.guestSubtitle}>Sign in to manage appointments, schedules, and notifications.</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/auth/login')}>
            <LogIn size={16} color="#ffffff" />
            <Text style={styles.signInBtnText}>Sign In / Register</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Selected City */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Preferred City</Text>
        <View style={styles.citiesGrid}>
          {SUPPORTED_CITIES.slice(0, 6).map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.cityChip, selectedCity === c && styles.cityChipActive]}
              onPress={() => setSelectedCity(c)}
            >
              <Text style={[styles.cityChipText, selectedCity === c && styles.cityChipTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Demo Role Switcher */}
      <View style={styles.sectionBox}>
        <View style={styles.demoHeader}>
          <Sparkles size={14} color="#0284c7" />
          <Text style={styles.sectionTitle}>Quick Demo Switcher</Text>
        </View>
        <Text style={styles.demoSubtitle}>Tap to immediately switch test account roles:</Text>

        <View style={styles.demoButtons}>
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => handleQuickDemoSwitch('patient@vacantup.com', 'Patient@123')}
          >
            <Text style={styles.demoBtnRole}>Patient Account</Text>
            <Text style={styles.demoBtnEmail}>patient@vacantup.com</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => handleQuickDemoSwitch('doctor@vacantup.com', 'Doctor@123')}
          >
            <Text style={[styles.demoBtnRole, { color: '#0d9488' }]}>Doctor (OPD)</Text>
            <Text style={styles.demoBtnEmail}>doctor@vacantup.com</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => handleQuickDemoSwitch('hospital@vacantup.com', 'Hospital@123')}
          >
            <Text style={[styles.demoBtnRole, { color: '#7c3aed' }]}>Hospital Admin</Text>
            <Text style={styles.demoBtnEmail}>hospital@vacantup.com</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => handleQuickDemoSwitch('admin@vacantup.com', 'Admin@123')}
          >
            <Text style={[styles.demoBtnRole, { color: '#e11d48' }]}>Platform Admin</Text>
            <Text style={styles.demoBtnEmail}>admin@vacantup.com</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout */}
      {user && (
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={16} color="#dc2626" />
          <Text style={styles.logoutBtnText}>Sign Out of VacantUp</Text>
        </TouchableOpacity>
      )}
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
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  userRoleBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284c7',
    backgroundColor: '#f0f9ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginVertical: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 11,
    color: '#64748b',
  },
  guestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  guestTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 10,
  },
  guestSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  signInBtn: {
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
  },
  signInBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionBox: {
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
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cityChipActive: {
    backgroundColor: '#0284c7',
  },
  cityChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  cityChipTextActive: {
    color: '#ffffff',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 10,
  },
  demoButtons: {
    gap: 8,
  },
  demoBtn: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 10,
  },
  demoBtnRole: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284c7',
  },
  demoBtnEmail: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 1,
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dc2626',
  },
});
