// Register screen.
// - Collects name, email, password
// - Calls register service → on success navigates to login
// - Shows field-level validation errors and a single API error message
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { register } from '../../src/services/auth.service';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { ApiError } from '../../src/types/api.types';
import axios from 'axios';

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Enter a valid email';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleRegister() {
    setApiError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      // Registration succeeded — go to login so user can sign in
      router.replace('/(auth)/login');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as ApiError | undefined;
        const message = data?.message;
        setApiError(Array.isArray(message) ? message[0] : (message ?? 'Something went wrong'));
      } else {
        setApiError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-10">
          <Text className="text-3xl font-bold text-black">Create account</Text>
          <Text className="text-base text-gray-500 mt-2">Sign up to get started</Text>
        </View>

        {/* Fields */}
        <Input
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="John Doe"
          autoCapitalize="words"
          error={fieldErrors.name}
        />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          error={fieldErrors.email}
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Min. 6 characters"
          secureTextEntry
          error={fieldErrors.password}
        />

        {/* API error */}
        {apiError ? (
          <Text className="text-sm text-red-500 mb-4 -mt-2">{apiError}</Text>
        ) : null}

        {/* Submit */}
        <View className="mt-2">
          <Button label="Create account" onPress={handleRegister} loading={loading} />
        </View>

        {/* Navigate to login */}
        <Pressable onPress={() => router.replace('/(auth)/login')} className="mt-6 items-center">
          <Text className="text-sm text-gray-500">
            Already have an account?{' '}
            <Text className="text-black font-semibold">Sign in</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
