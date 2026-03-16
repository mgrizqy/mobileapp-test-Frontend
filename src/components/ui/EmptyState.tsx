// Full-screen centered empty state message.
// Used when a list has no items to display.
import { Text, View } from 'react-native';

type Props = {
  message: string;
};

export function EmptyState({ message }: Props) {
  return (
    <View className="items-center py-16">
      <Text className="text-gray-400 text-base">{message}</Text>
    </View>
  );
}
