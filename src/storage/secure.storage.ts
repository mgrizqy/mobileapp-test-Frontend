// Single abstraction over expo-secure-store.
// All persisted account data flows through here — nothing else touches SecureStore directly.
//
// - load: read and parse the full account store from disk
// - save: serialize and write the full account store to disk
// - clear: wipe all account data (full logout everywhere)
import * as SecureStore from 'expo-secure-store';
import { PersistedAccountStore } from '../types/auth.types';

const STORE_KEY = 'account_store';

const EMPTY_STORE: PersistedAccountStore = {
  accounts: [],
  activeUserId: null,
};

export async function loadAccountStore(): Promise<PersistedAccountStore> {
  try {
    const raw = await SecureStore.getItemAsync(STORE_KEY);

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
  await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(store));
}

export async function clearAccountStore(): Promise<void> {
  await SecureStore.deleteItemAsync(STORE_KEY);
}
