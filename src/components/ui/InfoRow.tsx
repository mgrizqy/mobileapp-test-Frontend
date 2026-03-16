// Reusable label/value row for info cards.
// Optionally renders a divider below itself.
import { Text, View } from 'react-native';

type Props = {
  label: string;
  value: string;
  divider?: boolean;
};

export function InfoRow({ label, value, divider = false }: Props) {
  return (
    <>
      <View className="flex-row justify-between items-center px-4 py-4">
        <Text className="text-sm text-gray-500">{label}</Text>
        <Text className="text-sm font-medium text-black">{value}</Text>
      </View>
      {divider ? <View className="h-px bg-gray-200 mx-4" /> : null}
    </>
  );
}
