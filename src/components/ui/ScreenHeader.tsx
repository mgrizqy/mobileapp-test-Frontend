// Reusable screen header with title and optional subtitle.
// Keeps vertical spacing and typography consistent across all screens.
import { Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ title, subtitle }: Props) {
  return (
    <View className="px-6 pt-16 mb-8">
      <Text className="text-3xl font-bold text-black">{title}</Text>
      {subtitle ? (
        <Text className="text-base text-gray-500 mt-1">{subtitle}</Text>
      ) : null}
    </View>
  );
}
