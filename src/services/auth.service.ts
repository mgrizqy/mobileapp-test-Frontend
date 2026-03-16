// Orchestrates all authentication flows.
// Sits between the screens and the API/stores — screens never touch the API directly.
//
// - bootInit: called once on app launch, attempts silent refresh for active account
// - login: authenticate, persist account, hydrate auth store
// - logout: revoke session, remove account, clear auth state
// - switchAccount: set a different account as active, attempt silent refresh
import * as Device from 'expo-device';
import { loginUser, logoutUser, refreshTokens, registerUser } from '../api/auth.api';
import { getMe } from '../api/user.api';
import { getAccountsStore } from '../stores/accounts.store';
import { getAuthStore } from '../stores/auth.store';
import { Role } from '../types/user.types';

// ─── Boot ────────────────────────────────────────────────────────────────────

export async function bootInit(): Promise<void> {
  const { hydrate, activeAccount } = getAccountsStore();
  const { setAuth, clearAuth, setInitializing } = getAuthStore();

  await hydrate();

  // Re-read after hydrate so we get the freshly loaded active account
  const { activeAccount: loaded } = getAccountsStore();

  if (!loaded) {
    // No saved accounts — go straight to login
    setInitializing(false);
    return;
  }

  try {
    // Silently exchange the stored refresh token for a fresh access token
    const tokens = await refreshTokens(loaded.refreshToken);

    await getAccountsStore().updateRefreshToken(loaded.userId, tokens.refreshToken);

    // Decode role from the new access token payload
    const role = decodeRole(tokens.accessToken);

    setAuth(tokens.accessToken, loaded.userId, role);
  } catch {
    // Refresh token expired or revoked — remove this account and go to login
    await getAccountsStore().removeAccount(loaded.userId);
    clearAuth();
  }
}

// ─── Register ────────────────────────────────────────────────────────────────

export async function register(name: string, email: string, password: string): Promise<void> {
  await registerUser({ name, email, password });
  // Registration does not log the user in — they proceed to login screen
}

// ─── Login ───────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<void> {
  const deviceName = buildDeviceName();
  const tokens = await loginUser({ email, password, deviceName });

  console.log('🔑 Decoding token...');
  const role = decodeRole(tokens.accessToken);
  const userId = decodeUserId(tokens.accessToken);
  console.log('🔑 Decoded:', { role, userId });

  // Hydrate auth store first so the /me call has a valid access token to send
  getAuthStore().setAuth(tokens.accessToken, userId, role);
  console.log('✅ Auth store set');

  // Fetch name for display in account switcher — access token is now set so this works
  console.log('👤 Calling getMe...');
  const user = await getMe();
  console.log('👤 getMe response:', user);

  await getAccountsStore().addAccount({
    userId,
    email,
    name: user.name,
    refreshToken: tokens.refreshToken,
    deviceName,
  });
  console.log('✅ Account added, login complete');
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  const { activeAccount } = getAccountsStore();
  const { clearAuth } = getAuthStore();

  if (!activeAccount) {
    clearAuth();
    return;
  }

  try {
    await logoutUser(activeAccount.refreshToken);
  } catch {
    // Even if the server call fails, clean up locally so user is not stuck
  } finally {
    await getAccountsStore().removeAccount(activeAccount.userId);
    clearAuth();
  }
}

// ─── Switch Account ──────────────────────────────────────────────────────────

export async function switchAccount(userId: string): Promise<void> {
  const { setAuth, clearAuth } = getAuthStore();

  await getAccountsStore().setActiveAccount(userId);

  const { activeAccount } = getAccountsStore();
  if (!activeAccount) {
    clearAuth();
    return;
  }

  try {
    const tokens = await refreshTokens(activeAccount.refreshToken);

    await getAccountsStore().updateRefreshToken(userId, tokens.refreshToken);

    const role = decodeRole(tokens.accessToken);
    setAuth(tokens.accessToken, userId, role);
  } catch {
    // Refresh token for this account is expired — remove it
    await getAccountsStore().removeAccount(userId);
    clearAuth();
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildDeviceName(): string {
  const model = Device.modelName ?? 'Unknown Device';
  const os = Device.osName ?? 'Unknown OS';
  return `${model} · ${os}`;
}

function decodeRole(accessToken: string): Role {
  const payload = decodeJwtPayload(accessToken);
  return (payload?.role as Role) ?? Role.USER;
}

function decodeUserId(accessToken: string): string {
  const payload = decodeJwtPayload(accessToken);
  if (!payload?.sub) throw new Error('Invalid token — missing sub claim');
  return payload.sub as string;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    // JWT is three base64 segments separated by dots — the middle one is the payload
    const base64 = token.split('.')[1];

    // Buffer is Node.js only — React Native's JS engine uses atob instead.
    // base64url uses - and _ instead of + and /, so we normalize before decoding.
    const normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}
