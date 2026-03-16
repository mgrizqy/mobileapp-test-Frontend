// Sessions screen
// - Fetches all active sessions for the current user from the API
// - Each session shows the device name and creation date
// - Current session is identified by matching against the active account
// - Revoking a session deletes it on the backend — list refreshes after
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useAccountsStore } from '../../src/stores/accounts.store';
import { getSessions, revokeSession } from '../../src/api/sessions.api';
import { Session } from '../../src/types/session.types';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { EmptyState } from '../../src/components/ui/EmptyState';

export default function SessionsScreen() {
  const { activeAccount } = useAccountsStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await getSessions();
      console.log('📱 Sessions fetched:', data);
      // Show most recent session first
      setSessions(data.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.log('💥 Sessions fetch error:', error);
      Alert.alert('Error', 'Could not load sessions. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  function handleRefresh() {
    setRefreshing(true);
    fetchSessions();
  }

  async function handleRevoke(sessionId: string) {
    Alert.alert(
      'Revoke session',
      'This will sign out that device. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            setRevokingId(sessionId);
            try {
              await revokeSession(sessionId);
              // Remove from local list immediately — no need to refetch
              setSessions((prev) => prev.filter((s) => s._id !== sessionId));
            } catch {
              Alert.alert('Error', 'Could not revoke session. Please try again.');
            } finally {
              setRevokingId(null);
            }
          },
        },
      ],
    );
  }

  if (loading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-white pt-16">
      <ScreenHeader title="Sessions" subtitle="Devices signed in to your account" />

      <FlatList
        data={sessions}
        keyExtractor={(item) => item._id}
        contentContainerClassName="px-6 pb-8"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={<EmptyState message="No active sessions" />}
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            isCurrentDevice={item.deviceName === activeAccount?.deviceName}
            isRevoking={revokingId === item._id}
            onRevoke={() => handleRevoke(item._id)}
          />
        )}
      />
    </View>
  );
}

type SessionCardProps = {
  session: Session;
  isCurrentDevice: boolean;
  isRevoking: boolean;
  onRevoke: () => void;
};

function SessionCard({ session, isCurrentDevice, isRevoking, onRevoke }: SessionCardProps) {
  const date = new Date(session.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View className="bg-gray-50 rounded-xl p-4 flex-row items-center justify-between">
      <View className="flex-1 mr-4">
        <View className="flex-row items-center gap-2 mb-1">
          <Text className="text-sm font-semibold text-black">{session.deviceName}</Text>
          {isCurrentDevice && (
            <View className="bg-black rounded-full px-2 py-0.5">
              <Text className="text-white text-xs font-medium">This device</Text>
            </View>
          )}
        </View>
        <Text className="text-xs text-gray-400">Signed in {date}</Text>
      </View>

      {/* Cannot revoke the current device from here — use logout on Profile */}
      {!isCurrentDevice && (
        <Pressable
          onPress={onRevoke}
          disabled={isRevoking}
          className="active:opacity-60"
        >
          {isRevoking
            ? <ActivityIndicator size="small" color="#ef4444" />
            : <Text className="text-sm font-medium text-red-500">Revoke</Text>
          }
        </Pressable>
      )}
    </View>
  );
}
