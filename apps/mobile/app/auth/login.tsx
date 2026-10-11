import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight, CalendarCheck2 } from 'lucide-react-native';
import { useMobileAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useMobileAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (loginEmail?: string, loginPass?: string) => {
    const e = loginEmail || email;
    const p = loginPass || password;

    if (!e || !p) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(e, p);
      router.back();
    } catch (err: any) {
      Alert.alert('Sign In Failed', err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.brandIconBox}>
        <CalendarCheck2 size={36} color="#0284c7" />
      </View>

      <Text style={styles.title}>Sign In to VacantUp</Text>
      <Text style={styles.subtitle}>Access doctor availability, appointments, and queue passes</Text>

      {/* Quick Demo Switcher */}
      <View style={styles.demoCard}>
        <Text style={styles.demoTitle}>Instant Demo Accounts</Text>
        <View style={styles.demoRow}>
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => handleLogin('patient@vacantup.com', 'Patient@123')}
          >
            <Text style={styles.demoBtnRole}>Patient</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => handleLogin('doctor@vacantup.com', 'Doctor@123')}
          >
            <Text style={[styles.demoBtnRole, { color: '#0d9488' }]}>Doctor</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => handleLogin('hospital@vacantup.com', 'Hospital@123')}
          >
            <Text style={[styles.demoBtnRole, { color: '#7c3aed' }]}>Hospital</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Mail size={16} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Lock size={16} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          disabled={loading}
          onPress={() => handleLogin()}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Sign In</Text>
              <ArrowRight size={16} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.registerLink}
        onPress={() => router.replace('/auth/register')}
      >
        <Text style={styles.registerLinkText}>
          Don't have an account? <Text style={styles.boldBlue}>Create one</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  brandIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    maxWidth: 280,
  },
  demoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 8,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  demoBtnRole: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284c7',
  },
  form: {
    width: '100%',
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  submitBtn: {
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  registerLink: {
    marginTop: 24,
  },
  registerLinkText: {
    fontSize: 12,
    color: '#64748b',
  },
  boldBlue: {
    fontWeight: '800',
    color: '#0284c7',
  },
});
