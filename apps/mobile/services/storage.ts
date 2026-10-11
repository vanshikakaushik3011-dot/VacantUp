import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'vacantup_auth_token';
const ONBOARDING_KEY = 'vacantup_onboarding_completed';

// In-memory fallback if secure store is unavailable (e.g. web preview)
let memoryStore: Record<string, string> = {};

export const storage = {
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return memoryStore[TOKEN_KEY] || null;
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (err) {
      return memoryStore[TOKEN_KEY] || null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      memoryStore[TOKEN_KEY] = token;
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (err) {
      memoryStore[TOKEN_KEY] = token;
    }
  },

  async removeToken(): Promise<void> {
    try {
      delete memoryStore[TOKEN_KEY];
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (err) {
      delete memoryStore[TOKEN_KEY];
    }
  },

  async getOnboardingCompleted(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return memoryStore[ONBOARDING_KEY] === 'true';
      }
      const val = await SecureStore.getItemAsync(ONBOARDING_KEY);
      return val === 'true';
    } catch (err) {
      return memoryStore[ONBOARDING_KEY] === 'true';
    }
  },

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    try {
      memoryStore[ONBOARDING_KEY] = completed ? 'true' : 'false';
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(ONBOARDING_KEY, completed ? 'true' : 'false');
      }
    } catch (err) {
      memoryStore[ONBOARDING_KEY] = completed ? 'true' : 'false';
    }
  },
};
