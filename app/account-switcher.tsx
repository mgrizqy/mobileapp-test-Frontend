// Account switcher modal
// - Lists all accounts saved on this device
// - Active account is highlighted
// - Tapping an inactive account triggers a silent token refresh and switches context
// - "Add account" navigates to login without clearing the current session
// - Dismiss button closes the modal
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAccountsStore } from '../src/stores/accounts.store';
import { switchAccount } from '../src/services/auth.service';
import { StoredAccount } from '../src/types/auth.types';
import { EmptyState } from '../src/components/ui/EmptyState';

export default function AccountSwitcherScreen() {
  const { accounts, activeUserId } = useAccountsStore();
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  async function handleSwitch(userId: string) {
    // Already active — just dismiss
    if (userId === activeUserId) {
      router.replace('/(app)/home');
      return;
    }

    setSwitchingId(userId);
    try {
      await switchAccount(userId);
      router.replace('/(app)/home');
    } catch {
      Alert.alert('Error', 'Could not switch account. Please try again.');
    } finally {
      setSwitchingId(null);
    }
  }

  function handleAddAccount() {
    // Navigate to login — existing accounts are preserved in the store
    router.replace('/(auth)/login');
  }

  return (
    <View className="flex-1 bg-white">
      {/* Handle bar — visual affordance for modal */}
      <View className="items-center pt-3 pb-2">
        <View className="w-10 h-1 rounded-full bg-gray-200" />
      </View>

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
        <Text className="text-lg font-semibold text-black">Accounts</Text>
        <Pressable
          onPress={() => router.replace('/(app)/home')}
          className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center active:opacity-60"
        >
          <Text className="text-sm text-gray-600">✕</Text>
        </Pressable>
      </View>

      {/* Account list */}
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.userId}
        contentContainerClassName="px-6 py-4"
        ItemSeparatorComponent={() => <View className="h-2" />}
        ListEmptyComponent={<EmptyState message="No saved accounts" />}
        renderItem={({ item }) => (
          <AccountRow
            account={item}
            isActive={item.userId === activeUserId}
            isSwitching={switchingId === item.userId}
            onPress={() => handleSwitch(item.userId)}
          />
        )}
      />

      {/* Add account */}
      <View className="px-6 pb-10 pt-2 border-t border-gray-100">
        <Pressable
          onPress={handleAddAccount}
          className="flex-row items-center py-4 active:opacity-60"
        >
          <View className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center mr-4">
            <Text className="text-xl">＋</Text>
          </View>
          <Text className="text-base font-medium text-black">Add account</Text>
        </Pressable>
      </View>
    </View>
  );
}

type AccountRowProps = {
  account: StoredAccount;
  isActive: boolean;
  isSwitching: boolean;
  onPress: () => void;
};

function AccountRow({ account, isActive, isSwitching, onPress }: AccountRowProps) {
  // First letter of name as avatar
  const initial = account.name.charAt(0).toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      disabled={isSwitching}
      className={`flex-row items-center p-4 rounded-xl active:opacity-60 ${isActive ? 'bg-black' : 'bg-gray-50'}`}
    >
      {/* Avatar */}
      <View className={`w-11 h-11 rounded-full items-center justify-center mr-4 ${isActive ? 'bg-white/20' : 'bg-gray-200'}`}>
        <Text className={`text-base font-semibold ${isActive ? 'text-white' : 'text-black'}`}>
          {initial}
        </Text>
      </View>

      {/* Name + email */}
      <View className="flex-1">
        <Text className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-black'}`}>
          {account.name}
        </Text>
        <Text className={`text-xs mt-0.5 ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
          {account.email}
        </Text>
      </View>

      {/* Active checkmark or loading spinner */}
      {isSwitching ? (
        <ActivityIndicator size="small" color={isActive ? '#fff' : '#000'} />
      ) : isActive ? (
        <Text className="text-white text-base">✓</Text>
      ) : null}
    </Pressable>
  );
}
