import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MobileAuthProvider } from '../context/AuthContext';
import { MobileNotificationProvider } from '../context/NotificationContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MobileAuthProvider>
        <MobileNotificationProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#ffffff' },
              headerTintColor: '#0284c7',
              headerTitleStyle: { fontWeight: '700', fontSize: 16 },
              contentStyle: { backgroundColor: '#f8fafc' },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="doctor/[id]"
              options={{
                title: 'Doctor Profile',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="auth/login"
              options={{
                title: 'Sign In',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="auth/register"
              options={{
                title: 'Create Account',
                presentation: 'modal',
              }}
            />
          </Stack>
        </MobileNotificationProvider>
      </MobileAuthProvider>
    </SafeAreaProvider>
  );
}
