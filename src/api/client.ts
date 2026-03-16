// Axios instance with two interceptors:
// 1. REQUEST — attaches Authorization header from the active access token
// 2. RESPONSE — catches 401, attempts silent refresh, retries original request
//
// Refresh lock pattern: if a refresh is already in-flight, all other 401s
// wait for the same promise instead of firing their own refresh.
// This prevents the token rotation race condition.
import axios, { AxiosRequestConfig } from 'axios';
import { getAuthStore } from '../stores/auth.store';
import { getAccountsStore } from '../stores/accounts.store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';
console.log('🔧 Using API URL:', BASE_URL);

export const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Shared refresh lock — null means no refresh is in-flight
let refreshLock: Promise<string> | null = null;

// ─── Request Interceptor ─────────────────────────────────────────────────────

client.interceptors.request.use((config) => {
  const { accessToken } = getAuthStore();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// ─── Response Interceptor ────────────────────────────────────────────────────

client.interceptors.response.use(
  // Success — pass through untouched
  (response) => response,

  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retried?: boolean };

    const is401 = error.response?.status === 401;
    const alreadyRetried = originalRequest._retried === true;

    // If not a 401 or already retried — propagate the error, do not loop
    if (!is401 || alreadyRetried) {
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    try {
      // If a refresh is already in-flight, wait for it instead of starting another
      if (!refreshLock) {
        refreshLock = attemptSilentRefresh().finally(() => {
          refreshLock = null;
        });
      }

      const newAccessToken = await refreshLock;

      // Retry the original request with the new token
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };

      return client(originalRequest);
    } catch {
      // Refresh failed — clear auth state, Expo Router will redirect to login
      getAuthStore().clearAuth();
      return Promise.reject(error);
    }
  },
);

// ─── Silent Refresh ──────────────────────────────────────────────────────────

async function attemptSilentRefresh(): Promise<string> {
  const { activeAccount } = getAccountsStore();

  if (!activeAccount) throw new Error('No active account');

  // Inline import to avoid circular dependency (client ← auth.api ← client)
  const { refreshTokens } = await import('./auth.api');
  const tokens = await refreshTokens(activeAccount.refreshToken);

  // Update in-memory access token
  getAuthStore().setAccessToken(tokens.accessToken);

  // Update persisted refresh token (rotation — old one is now invalid)
  await getAccountsStore().updateRefreshToken(activeAccount.userId, tokens.refreshToken);

  return tokens.accessToken;
}
