import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HealthCheck } from './HealthCheck';
import * as api from '../services/api';

describe('HealthCheck Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders healthy status when API call succeeds', async () => {
    vi.spyOn(api, 'fetchHealth').mockResolvedValue({
      status: 'healthy',
      service: 'cloudresumeai-backend',
      version: '0.1.0',
      timestamp: '2026-10-29T12:00:00Z',
      environment: 'development',
      database: { status: 'connected', message: 'PostgreSQL connection successful' },
    });

    render(<HealthCheck />);

    expect(screen.getByRole('status')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/healthy/i)).toBeInTheDocument();
      expect(screen.getByText('cloudresumeai-backend')).toBeInTheDocument();
      expect(screen.getByText('connected')).toBeInTheDocument();
    });
  });

  it('renders error alert when backend is unreachable', async () => {
    vi.spyOn(api, 'fetchHealth').mockRejectedValue(new Error('Connection refused'));

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Backend Unreachable')).toBeInTheDocument();
      expect(screen.getByText(/Connection refused/i)).toBeInTheDocument();
    });
  });
});
