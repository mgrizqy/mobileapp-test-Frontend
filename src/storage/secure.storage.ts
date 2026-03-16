// Single abstraction over expo-secure-store.
// All persisted account data flows through here — nothing else touches SecureStore directly.
//
// - load: read and parse the full account store from disk
// - save: serialize and write the full account store to disk
// - clear: wipe all account data (full logout everywhere)
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { PersistedAccountStore } from '../types/auth.types';

const STORE_KEY = 'account_store';

const EMPTY_STORE: PersistedAccountStore = {
  accounts: [],
  activeUserId: null,
};

// Web fallback — localStorage is fine for development, native uses SecureStore
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
    await SecureStore.setItemAsync(key, value);
  },
  deleteItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
    await SecureStore.deleteItemAsync(key);
  },
};

export async function loadAccountStore(): Promise<PersistedAccountStore> {
  try {
    const raw = await storage.getItem(STORE_KEY);

    // No data on disk yet — first launch
    if (!raw) return EMPTY_STORE;

    return JSON.parse(raw) as PersistedAccountStore;
  } catch {
    // Corrupted data — wipe and start fresh rather than crashing
    await clearAccountStore();
    return EMPTY_STORE;
  }
}

export async function saveAccountStore(store: PersistedAccountStore): Promise<void> {
  await storage.setItem(STORE_KEY, JSON.stringify(store));
}

export async function clearAccountStore(): Promise<void> {
  await storage.deleteItem(STORE_KEY);
}
