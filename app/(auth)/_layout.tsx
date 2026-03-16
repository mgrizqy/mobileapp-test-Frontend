// Layout for unauthenticated screens (login, register).
// No tab bar — clean stack navigation.
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
