import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { isMsalConfigured, getApiTokenRequest } from './msalConfig';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthProvider } from './AuthProvider';
import { AuthContext, AuthContextType } from './AuthContext';
import {
  setGlobalTokenGetter,
  setGlobalDevEmailGetter,
  getAuthHeaders,
  isDevAuthEnabled,
} from '../services/authToken';

describe('msalConfig environment helper', () => {
  it('returns false when client ID is placeholder or absent', () => {
    expect(isMsalConfigured()).toBe(false);
  });

  it('getApiTokenRequest throws clear error when VITE_AZURE_ENTRA_API_SCOPE is missing', () => {
    // In test environment, VITE_AZURE_ENTRA_API_SCOPE is undefined or placeholder
    expect(() => getApiTokenRequest()).toThrow(
      /VITE_AZURE_ENTRA_API_SCOPE.*must be explicitly configured/
    );
  });
});

describe('authToken helper', () => {
  afterEach(() => {
    setGlobalTokenGetter(null);
    setGlobalDevEmailGetter(null);
  });

  it('returns empty headers when no token getter is configured', async () => {
    setGlobalTokenGetter(null);
    setGlobalDevEmailGetter(null);
    const headers = await getAuthHeaders();
    expect(headers).toEqual({});
  });

  it('attaches Authorization Bearer header when token getter returns token', async () => {
    setGlobalTokenGetter(async () => 'mock-jwt-access-token');
    const headers = await getAuthHeaders();
    expect(headers).toEqual({
      Authorization: 'Bearer mock-jwt-access-token',
    });
  });

  it('returns empty headers when token getter throws or returns null without dev email', async () => {
    setGlobalTokenGetter(async () => {
      throw new Error('Token acquisition failed');
    });
    setGlobalDevEmailGetter(null);
    const headers = await getAuthHeaders();
    expect(headers).toEqual({});
  });

  it('attaches X-Dev-User-Email when dev auth is enabled and dev email is configured', async () => {
    setGlobalTokenGetter(null);
    setGlobalDevEmailGetter(() => 'alex.mercer@cloudresume.ai');
    expect(isDevAuthEnabled()).toBe(true);

    const headers = await getAuthHeaders();
    expect(headers).toEqual({
      'X-Dev-User-Email': 'alex.mercer@cloudresume.ai',
    });
  });

  it('prioritizes Bearer token over X-Dev-User-Email when token exists', async () => {
    setGlobalTokenGetter(async () => 'valid-entra-token');
    setGlobalDevEmailGetter(() => 'alex.mercer@cloudresume.ai');

    const headers = await getAuthHeaders();
    expect(headers).toEqual({
      Authorization: 'Bearer valid-entra-token',
    });
    expect(headers['X-Dev-User-Email']).toBeUndefined();
  });

  it('returns empty headers when dev email getter returns null (logged out)', async () => {
    setGlobalTokenGetter(null);
    setGlobalDevEmailGetter(() => null);

    const headers = await getAuthHeaders();
    expect(headers).toEqual({});
  });
});

describe('ProtectedRoute component', () => {
  const createMockAuth = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
    isAuthenticated: true,
    user: { name: 'Alex Mercer', email: 'alex@example.com' },
    token: null,
    loading: false,
    error: null,
    isMsalConfigured: true,
    registerUser: vi.fn(),
    loginWithCredentials: vi.fn(),
    login: vi.fn(),
    loginWithGoogle: vi.fn(),
    loginAsDemo: vi.fn(),
    logout: vi.fn(),
    getAccessToken: vi.fn(),
    ...overrides,
  });

  it('renders children when user is authenticated', () => {
    const mockAuth = createMockAuth({ isAuthenticated: true });
    render(
      <AuthContext.Provider value={mockAuth}>
        <ProtectedRoute>
          <div data-testid="protected-content">Secret Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Secret Content')).toBeInTheDocument();
  });

  it('renders sign-in barrier when user is unauthenticated', () => {
    const mockAuth = createMockAuth({
      isAuthenticated: false,
      isMsalConfigured: true,
    });
    render(
      <AuthContext.Provider value={mockAuth}>
        <ProtectedRoute>
          <div data-testid="protected-content">Secret Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(
      screen.getByText('Sign in to CloudResumeAI')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Sign in with Microsoft Entra')
    ).toBeInTheDocument();
  });

  it('shows loading spinner when auth state is loading', () => {
    const mockAuth = createMockAuth({
      loading: true,
      isAuthenticated: false,
    });
    render(
      <AuthContext.Provider value={mockAuth}>
        <ProtectedRoute>
          <div>Protected</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    );

    expect(
      screen.getByText(/checking authentication session/i)
    ).toBeInTheDocument();
  });
});

describe('AuthProvider in development mode', () => {
  it('renders children with active development user when MSAL is unconfigured', () => {
    render(
      <AuthProvider>
        <div data-testid="dev-app">Dev Mode Application</div>
      </AuthProvider>
    );

    expect(screen.getByTestId('dev-app')).toBeInTheDocument();
    expect(screen.getByText('Dev Mode Application')).toBeInTheDocument();
  });
});

