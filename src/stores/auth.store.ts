// In-memory auth state. Never persisted to disk.
// Holds the active access token and user identity for the current session.
//
// getAuthStore() is exported for use outside React components (e.g. axios interceptors).
// useAuthStore() is exported for use inside React components.
import { create } from 'zustand';
import { AuthState } from '../types/auth.types';
import { Role } from '../types/user.types';

type AuthStore = AuthState & {
  setAuth: (accessToken: string, userId: string, role: Role) => void;
  setAccessToken: (accessToken: string) => void;
  setInitializing: (value: boolean) => void;
  clearAuth: () => void;
};

const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  userId: null,
  role: null,
  isAuthenticated: false,
  isInitializing: true,

  setAuth: (accessToken, userId, role) =>
    set({ accessToken, userId, role, isAuthenticated: true, isInitializing: false }),

  setAccessToken: (accessToken) =>
    set({ accessToken }),

  setInitializing: (value) =>
    set({ isInitializing: value }),

  clearAuth: () =>
    set({
      accessToken: null,
      userId: null,
      role: null,
      isAuthenticated: false,
      isInitializing: false,
    }),
}));

// For use inside React components
export { useAuthStore };

// For use outside React (axios interceptors, services)
export const getAuthStore = () => useAuthStore.getState();
