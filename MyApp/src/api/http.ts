import { Platform } from 'react-native';
import { ApiError } from '../types/app';

function defaultBaseUrl() {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  return 'http://localhost:8000';
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
    errors?: {
      formErrors?: string[];
      fieldErrors?: Record<string, string[]>;
    };
  };

  if (!response.ok) {
    let finalMessage = data?.message || data?.error || 'Request failed';

    // Surface Zod validation errors if present
    if (data?.errors) {
      if (data.errors.formErrors && data.errors.formErrors.length > 0) {
        finalMessage = data.errors.formErrors[0];
      } else if (data.errors.fieldErrors) {
        const fields = Object.keys(data.errors.fieldErrors);
        if (fields.length > 0) {
          const firstField = fields[0];
          const firstErrorMessages = data.errors.fieldErrors[firstField];
          if (firstErrorMessages && firstErrorMessages.length > 0) {
            finalMessage = firstErrorMessages[0];
          }
        }
      }
    }

    const error: ApiError = {
      message: finalMessage,
      status: response.status,
    };

    throw error;
  }

  return data;
}
