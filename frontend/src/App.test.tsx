import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import * as api from './services/api';

vi.mock('./services/api', () => ({
  fetchHealth: vi.fn().mockResolvedValue({
    status: 'healthy',
    service: 'cloudresumeai-backend',
    version: '0.1.0',
    timestamp: '2026-10-29T12:00:00Z',
    environment: 'development',
    database: { status: 'unconfigured' },
  }),
}));

describe('App Router', () => {
  it('renders landing page on / route', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    expect(screen.getByText(/get interviews/i)).toBeInTheDocument();
  });

  it('shows nav links', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    expect(screen.getAllByText('CloudResumeAI').length).toBeGreaterThan(0);
  });
});

// suppress unused import warning
void api;
