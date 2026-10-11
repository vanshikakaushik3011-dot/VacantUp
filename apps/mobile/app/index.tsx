import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMobileAuth } from '../context/AuthContext';

export default function IndexScreen() {
  const { hasSeenOnboarding, loading } = useMobileAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!hasSeenOnboarding) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)/home');
      }
    }
  }, [loading, hasSeenOnboarding]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
      <ActivityIndicator size="large" color="#0284c7" />
    </View>
  );
}
