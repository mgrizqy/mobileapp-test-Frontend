import { Role } from './user.types';

// Tokens returned by login and refresh endpoints
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

// One entry per saved account in SecureStore
export type StoredAccount = {
  userId: string;
  email: string;
  name: string;
  refreshToken: string;
};

// The full structure persisted as one JSON blob in SecureStore
export type PersistedAccountStore = {
  accounts: StoredAccount[];
  activeUserId: string | null;
};

// In-memory auth state — lives in Zustand, never touches disk
export type AuthState = {
  accessToken: string | null;
  userId: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  // True only during app boot while we attempt a silent token refresh
  isInitializing: boolean;
};
