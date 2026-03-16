// Reusable text input with label and error state.
import { Text, TextInput, View } from 'react-native';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
  error?: string;
};

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  error,
}: Props) {
  return (
    <View className="w-full gap-1 mb-4">
      <Text className="text-sm font-medium text-gray-700">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        placeholderTextColor="#9ca3af"
        className={`w-full border rounded-xl px-4 py-3 text-base text-black bg-white ${error ? 'border-red-400' : 'border-gray-200'}`}
      />
      {error ? <Text className="text-xs text-red-500">{error}</Text> : null}
    </View>
  );
}
