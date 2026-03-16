// Root layout — the first thing that runs on every app launch.
// Responsibilities:
// - Import global CSS for NativeWind
// - Run bootInit once to attempt silent token refresh for saved accounts
// - Watch auth state and redirect to the correct screen reactively
// - Declare the account-switcher as a root-level modal so it slides over the tab bar
import { useEffect } from 'react';
import { View } from 'react-native';
import { router, Stack } from 'expo-router';
import { useAuthStore } from '../src/stores/auth.store';
import { bootInit } from '../src/services/auth.service';
import '../global.css';

export default function RootLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);

  useEffect(() => {
    bootInit();
  }, []);

  useEffect(() => {
    if (isInitializing) return;

    if (isAuthenticated) {
      router.replace('/(app)/home');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isInitializing]);

  // Blank screen while boot is in progress — no flash of wrong content
  if (isInitializing) {
    return <View className="flex-1 bg-white" />;
  }

  return (
    <Stack>
      {/* Auth screens — no header */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />

      {/* App screens (tabs) — no header, tab bar handles navigation */}
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}
