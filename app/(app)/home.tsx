// Home screen
// - Displays welcome message with user's name from active account
// - Shows a summary card for signed-in accounts
// - Account switcher accessible via header button
// - No API calls — all data comes from the accounts store
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAccountsStore } from '../../src/stores/accounts.store';

export default function HomeScreen() {
  const { activeAccount, accounts } = useAccountsStore();

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      {/* Header row — greeting + account switcher button */}
      <View className="flex-row items-center justify-between mb-8">
        <View>
          <Text className="text-3xl font-bold text-black">
            Hello, {activeAccount?.name ?? 'there'} 👋
          </Text>
          <Text className="text-base text-gray-500 mt-1">
            {activeAccount?.email}
          </Text>
        </View>

        {/* Opens the account switcher modal */}
        <Pressable
          onPress={() => router.push('/account-switcher')}
          className="bg-gray-100 rounded-full w-10 h-10 items-center justify-center active:opacity-60"
        >
          <Text className="text-lg">🔄</Text>
        </Pressable>
      </View>

      {/* Accounts summary card */}
      <View className="bg-gray-50 rounded-xl p-6">
        <Text className="text-lg font-semibold text-black mb-1">
          Signed in accounts
        </Text>
        <Text className="text-gray-500 text-sm">
          {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'} on this device
        </Text>
      </View>
    </View>
  );
}
