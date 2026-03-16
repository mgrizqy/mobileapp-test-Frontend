// Profile screen
// - Displays current user's info from the active account in the store
// - Logout button revokes the session and clears auth state
// - No API calls on mount — data already hydrated at login
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAccountsStore } from '../../src/stores/accounts.store';
import { useAuthStore } from '../../src/stores/auth.store';
import { logout } from '../../src/services/auth.service';
import { Button } from '../../src/components/ui/Button';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { InfoRow } from '../../src/components/ui/InfoRow';

export default function ProfileScreen() {
  const { activeAccount, accounts } = useAccountsStore();
  const { role } = useAuthStore();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out of this account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Check before logout — after removeAccount the list will already be shorter
              const remainingAccounts = accounts.filter((a) => a.userId !== activeAccount?.userId);

              await logout();

              if (remainingAccounts.length > 0) {
                // Other accounts exist — let the user pick one
                router.replace('/account-switcher');
              }
              // If no accounts remain, root layout sees isAuthenticated=false and redirects to login
            } catch {
              Alert.alert('Error', 'Something went wrong. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  }

  if (!activeAccount) return null;

  const memberSince = new Date(activeAccount.userId
    ? parseInt(activeAccount.userId.substring(0, 8), 16) * 1000
    : Date.now()
  ).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Profile" />

      {/* Avatar placeholder */}
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-3">
          <Text className="text-3xl">👤</Text>
        </View>
        <Text className="text-xl font-semibold text-black">{activeAccount.name}</Text>
        <View className="bg-gray-100 rounded-full px-3 py-1 mt-2">
          <Text className="text-xs font-medium text-gray-600 capitalize">{role}</Text>
        </View>
      </View>

      {/* Info rows */}
      <View className="bg-gray-50 rounded-xl overflow-hidden mb-6 mx-6">
        <InfoRow label="Email" value={activeAccount.email} divider />
        <InfoRow label="Member since" value={memberSince} />
      </View>

      {/* Logout */}
      <View className="mx-6">
        <Button
          label="Sign out"
          onPress={handleLogout}
          loading={loading}
          variant="ghost"
        />
      </View>
    </View>
  );
}
