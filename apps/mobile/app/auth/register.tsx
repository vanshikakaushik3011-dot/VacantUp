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
import { User, Mail, Lock, Phone, ArrowRight, CalendarCheck2 } from 'lucide-react-native';
import { useMobileAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useMobileAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in your name, email, and password.');
      return;
    }

    try {
      setLoading(true);
      await register({ name, email, password, phone, role });
      router.back();
    } catch (err: any) {
      Alert.alert('Registration Failed', err.response?.data?.error || 'Could not complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.brandIconBox}>
        <CalendarCheck2 size={36} color="#0284c7" />
      </View>

      <Text style={styles.title}>Join VacantUp</Text>
      <Text style={styles.subtitle}>Create your profile to book instant doctor appointments</Text>

      {/* Role Selector */}
      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[styles.roleBtn, role === 'PATIENT' && styles.roleBtnActive]}
          onPress={() => setRole('PATIENT')}
        >
          <Text style={[styles.roleBtnText, role === 'PATIENT' && styles.roleBtnTextActive]}>
            Patient
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleBtn, role === 'DOCTOR' && styles.roleBtnActive]}
          onPress={() => setRole('DOCTOR')}
        >
          <Text style={[styles.roleBtnText, role === 'DOCTOR' && styles.roleBtnTextActive]}>
            Doctor / Practitioner
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <User size={16} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="e.g. Rahul Verma"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

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
          <Text style={styles.label}>Phone Number (Optional)</Text>
          <View style={styles.inputWrapper}>
            <Phone size={16} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="+91 98765 43210"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password (minimum 6 characters)</Text>
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
          onPress={handleRegister}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Create Account</Text>
              <ArrowRight size={16} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => router.replace('/auth/login')}
      >
        <Text style={styles.loginLinkText}>
          Already registered? <Text style={styles.boldBlue}>Sign In</Text>
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
  roleRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    width: '100%',
    marginBottom: 20,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  roleBtnTextActive: {
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
  loginLink: {
    marginTop: 24,
  },
  loginLinkText: {
    fontSize: 12,
    color: '#64748b',
  },
  boldBlue: {
    fontWeight: '800',
    color: '#0284c7',
  },
});
