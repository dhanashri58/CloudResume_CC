import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchHealth, formatFriendlyErrorMessage } from './api';

describe('fetchHealth API service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('successfully fetches health data', async () => {
    const mockPayload = {
      status: 'healthy',
      service: 'cloudresumeai-backend',
      version: '0.1.0',
      timestamp: '2026-10-29T12:00:00Z',
      environment: 'development',
      database: { status: 'connected', message: 'PostgreSQL connection successful' },
      storage: { mode: 'azure', status: 'configured', container: 'cloudresumeai-resumes' },
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    }));

    const result = await fetchHealth();
    expect(result).toEqual(mockPayload);
    expect(fetch).toHaveBeenCalledWith('/api/health', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  });

  it('throws an informative error when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    }));

    await expect(fetchHealth()).rejects.toThrow('Health check failed with HTTP 500: Internal Server Error');
  });

  it('catches network fetch failure and provides friendly error message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(fetchHealth()).rejects.toThrow(
      'Backend service is currently unreachable. Please check your network connection.'
    );
  });

  it('formatFriendlyErrorMessage converts errors properly', () => {
    expect(formatFriendlyErrorMessage(new TypeError('failed to fetch'))).toBe(
      'Backend service is currently unreachable. Please check your network connection.'
    );
    expect(formatFriendlyErrorMessage(new Error('Custom API error'))).toBe('Custom API error');
    expect(formatFriendlyErrorMessage(null, 'Default fallback')).toBe('Default fallback');
  });
});

