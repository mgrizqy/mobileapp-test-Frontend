// All HTTP calls for authentication endpoints.
// No logic here — just shapes the request and returns the response.
import { client } from './client';
import { AuthTokens } from '../types/auth.types';

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
  deviceName: string;
};

export async function registerUser(payload: RegisterPayload): Promise<{ message: string; userId: string }> {
  console.log('📤 Register API call:', { 
    url: `${client.defaults.baseURL}/auth/register`,
    payload 
  });

  try {
    const response = await client.post('/auth/register', payload);
    console.log('📥 Register API response:', response.data);
    return response.data;
  } catch (error) {
    console.log('💥 Register API error:', error);
    throw error;
  }
}

export async function loginUser(payload: LoginPayload): Promise<AuthTokens> {
  console.log('📤 Login API call:', {
    url: `${client.defaults.baseURL}/auth/login`,
    payload: { ...payload, password: '[REDACTED]' },
  });

  try {
    const response = await client.post('/auth/login', payload);
    console.log('📥 Login API response:', response.data);
    return response.data;
  } catch (error) {
    console.log('💥 Login API error:', error);
    throw error;
  }
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const response = await client.post('/auth/refresh', { refreshToken });
  return response.data;
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await client.post('/auth/logout', { refreshToken });
}
