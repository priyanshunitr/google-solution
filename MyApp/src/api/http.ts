import { Platform } from 'react-native';
import { ApiError } from '../types/app';

function defaultBaseUrl() {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001';
  }

  return 'http://localhost:3001';
}

export const API_BASE_URL = defaultBaseUrl();

export async function httpRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string;
    error?: string;
  };

  if (!response.ok) {
    const error: ApiError = {
      message: data?.message || data?.error || 'Request failed',
      status: response.status,
    };

    throw error;
  }

  return data;
}
