export interface DatabaseStatus {
  status: 'connected' | 'unreachable' | 'unconfigured' | 'driver_missing' | string;
  message?: string;
}

export interface StorageStatus {
  mode: string;
  status: string;
  container?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  environment: string;
  database: DatabaseStatus;
  storage?: StorageStatus;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Converts generic or network errors into clear, actionable messages.
 */
export function formatFriendlyErrorMessage(
  err: unknown,
  fallback = 'An unexpected error occurred. Please try again.'
): string {
  if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
    return 'Backend service is currently unreachable. Please check your network connection.';
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

/**
 * Fetch backend health status.
 */
export async function fetchHealth(): Promise<HealthResponse> {
  const url = `${API_BASE_URL}/api/health`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Health check failed with HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data: HealthResponse = await response.json();
    return data;
  } catch (err: unknown) {
    throw new Error(
      formatFriendlyErrorMessage(
        err,
        'Backend service is unreachable. Please verify server status.'
      )
    );
  }
}

