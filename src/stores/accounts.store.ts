// Persisted multi-account list. Mirrors what is stored in SecureStore.
// Loaded once on app boot, kept in sync on every login/logout/switch.
//
// getAccountsStore() is exported for use outside React components (e.g. axios interceptors).
// useAccountsStore() is exported for use inside React components.
import { create } from 'zustand';
import { StoredAccount, PersistedAccountStore } from '../types/auth.types';
import { loadAccountStore, saveAccountStore } from '../storage/secure.storage';

type AccountsStore = {
  accounts: StoredAccount[];
  activeUserId: string | null;
  activeAccount: StoredAccount | null;

  hydrate: () => Promise<void>;
  addAccount: (account: StoredAccount) => Promise<void>;
  removeAccount: (userId: string) => Promise<void>;
  setActiveAccount: (userId: string) => Promise<void>;
  updateRefreshToken: (userId: string, newRefreshToken: string) => Promise<void>;
  clearAll: () => Promise<void>;
};

const useAccountsStore = create<AccountsStore>((set, get) => ({
  accounts: [],
  activeUserId: null,
  activeAccount: null,

  // Read from SecureStore and hydrate this store — called once on app boot
  hydrate: async () => {
    const persisted = await loadAccountStore();
    const activeAccount = persisted.accounts.find(
      (a) => a.userId === persisted.activeUserId,
    ) ?? null;

    set({
      accounts: persisted.accounts,
      activeUserId: persisted.activeUserId,
      activeAccount,
    });
  },

  addAccount: async (account) => {
    const { accounts } = get();

    // Replace if account already exists, otherwise append
    const filtered = accounts.filter((a) => a.userId !== account.userId);
    const updated = [...filtered, account];

    const store: PersistedAccountStore = {
      accounts: updated,
      activeUserId: account.userId,
    };

    await saveAccountStore(store);

    set({
      accounts: updated,
      activeUserId: account.userId,
      activeAccount: account,
    });
  },

  removeAccount: async (userId) => {
    const { accounts, activeUserId } = get();
    const updated = accounts.filter((a) => a.userId !== userId);

    const newActiveUserId = activeUserId === userId ? null : activeUserId;
    const newActiveAccount = updated.find((a) => a.userId === newActiveUserId) ?? null;

    const store: PersistedAccountStore = {
      accounts: updated,
      activeUserId: newActiveUserId,
    };

    await saveAccountStore(store);

    set({
      accounts: updated,
      activeUserId: newActiveUserId,
      activeAccount: newActiveAccount,
    });
  },

  setActiveAccount: async (userId) => {
    const { accounts } = get();
    const account = accounts.find((a) => a.userId === userId) ?? null;

    const store: PersistedAccountStore = {
      accounts,
      activeUserId: userId,
    };

    await saveAccountStore(store);

    set({ activeUserId: userId, activeAccount: account });
  },

  // Called after every token rotation — keeps stored refresh token in sync
  updateRefreshToken: async (userId, newRefreshToken) => {
    const { accounts } = get();

    const updated = accounts.map((a) =>
      a.userId === userId ? { ...a, refreshToken: newRefreshToken } : a,
    );

    const store: PersistedAccountStore = {
      accounts: updated,
      activeUserId: get().activeUserId,
    };

    await saveAccountStore(store);

    const newActiveAccount = updated.find((a) => a.userId === get().activeUserId) ?? null;

    set({ accounts: updated, activeAccount: newActiveAccount });
  },

  clearAll: async () => {
    await saveAccountStore({ accounts: [], activeUserId: null });
    set({ accounts: [], activeUserId: null, activeAccount: null });
  },
}));

// For use inside React components
export { useAccountsStore };

// For use outside React (axios interceptors, services)
export const getAccountsStore = () => useAccountsStore.getState();
