// Login screen.
// - Collects email and password
// - Calls login service → on success root layout redirects to home automatically
// - Shows API error message on failed login
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { login } from '../../src/services/auth.service';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { ApiError } from '../../src/types/api.types';
import axios from 'axios';

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Enter a valid email';
    if (!password) errors.password = 'Password is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleLogin() {
    setApiError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      // Auth store is now updated — root layout will redirect to home automatically
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
          <Text className="text-3xl font-bold text-black">Welcome back</Text>
          <Text className="text-base text-gray-500 mt-2">Sign in to your account</Text>
        </View>

        {/* Fields */}
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
          placeholder="Your password"
          secureTextEntry
          error={fieldErrors.password}
        />

        {/* API error */}
        {apiError ? (
          <Text className="text-sm text-red-500 mb-4 -mt-2">{apiError}</Text>
        ) : null}

        {/* Submit */}
        <View className="mt-2">
          <Button label="Sign in" onPress={handleLogin} loading={loading} />
        </View>

        {/* Navigate to register */}
        <Pressable onPress={() => router.push('/(auth)/register')} className="mt-6 items-center">
          <Text className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Text className="text-black font-semibold">Sign up</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
