// Reusable button component with loading state.
import { ActivityIndicator, Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
};

export function Button({ label, onPress, loading = false, disabled = false, variant = 'primary' }: Props) {
  const isDisabled = disabled || loading;

  const baseClasses = 'w-full rounded-xl py-4 items-center justify-center';
  const primaryClasses = 'bg-black';
  const ghostClasses = 'bg-transparent border border-gray-300';
  const disabledClasses = 'opacity-40';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`${baseClasses} ${variant === 'primary' ? primaryClasses : ghostClasses} ${isDisabled ? disabledClasses : ''}`}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? '#fff' : '#000'} />
        : <Text className={`font-semibold text-base ${variant === 'primary' ? 'text-white' : 'text-black'}`}>{label}</Text>
      }
    </Pressable>
  );
}
