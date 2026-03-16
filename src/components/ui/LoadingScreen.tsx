// Full-screen centered loading indicator.
// Used while async data is being fetched on initial screen mount.
import { ActivityIndicator, View } from 'react-native';

export function LoadingScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}
