// All HTTP calls for user endpoints.
import { client } from './client';
import { User } from '../types/user.types';

export async function getMe(): Promise<User> {
  const response = await client.get('/users/me');
  return response.data;
}
