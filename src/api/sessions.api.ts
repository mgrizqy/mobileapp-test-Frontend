// All HTTP calls for session endpoints.
import { client } from './client';
import { Session } from '../types/session.types';

export async function getSessions(): Promise<Session[]> {
  const response = await client.get('/sessions');
  return response.data;
}

export async function revokeSession(sessionId: string): Promise<void> {
  await client.delete(`/sessions/${sessionId}`);
}
