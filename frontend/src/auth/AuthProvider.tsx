import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MsalProvider,
  useMsal,
  useIsAuthenticated,
  useAccount,
} from '@azure/msal-react';
import type { IPublicClientApplication, AccountInfo } from '@azure/msal-browser';
import {
  isMsalConfigured,
  getMsalInstance,
  loginRequest,
  getApiTokenRequest,
} from './msalConfig';
import {
  AuthContext,
  AuthContextType,
  AuthUser,
  RegisterData,
  LoginCredentials,
  AuthResponseResult,
} from './AuthContext';
import { setGlobalTokenGetter, setGlobalDevEmailGetter } from '../services/authToken';

/**
 * Inner adapter consuming @azure/msal-react hooks when MSAL is configured.
 */
const MsalAuthAdapter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const activeAccount = useAccount(accounts[0] || null);
  const [authError, setAuthError] = useState<string | null>(null);

  const user: AuthUser | null = useMemo(() => {
    if (!isAuthenticated || !activeAccount) return null;
    const claims = (activeAccount.idTokenClaims as Record<string, unknown>) || {};
    return {
      id: activeAccount.localAccountId,
      name:
        activeAccount.name ||
        (claims.name as string) ||
        (claims.given_name as string) ||
        'User',
      email:
        activeAccount.username ||
        (claims.email as string) ||
        (claims.preferred_username as string),
      username: activeAccount.username,
    };
  }, [isAuthenticated, activeAccount]);

  const login = useCallback(async () => {
    try {
      setAuthError(null);
      await instance.loginPopup(loginRequest);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setAuthError(msg);
      console.error('[MSAL] Login popup error:', err);
    }
  }, [instance]);

  const logout = useCallback(async () => {
    try {
      setAuthError(null);
      await instance.logoutPopup();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Logout failed';
      setAuthError(msg);
      console.error('[MSAL] Logout error:', err);
    }
  }, [instance]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!accounts[0]) return null;
    const request = {
      ...getApiTokenRequest(),
      account: accounts[0] as AccountInfo,
    };
    try {
      const response = await instance.acquireTokenSilent(request);
      return response.accessToken;
    } catch (silentErr) {
      console.warn('[MSAL] Silent token acquisition failed, prompting popup:', silentErr);
      try {
        const popupResponse = await instance.acquireTokenPopup(request);
        return popupResponse.accessToken;
      } catch (popupErr: unknown) {
        const msg = popupErr instanceof Error ? popupErr.message : 'Token acquisition failed';
        setAuthError(msg);
        console.error('[MSAL] Popup token acquisition failed:', popupErr);
        return null;
      }
    }
  }, [instance, accounts]);

  useEffect(() => {
    setGlobalTokenGetter(getAccessToken);
    setGlobalDevEmailGetter(null);
    return () => {
      setGlobalTokenGetter(null);
      setGlobalDevEmailGetter(null);
    };
  }, [getAccessToken]);

  const registerUser = useCallback(async (): Promise<AuthResponseResult> => {
    return { success: false, error: 'Registration is managed through Microsoft Entra.' };
  }, []);

  const loginWithCredentials = useCallback(async (): Promise<AuthResponseResult> => {
    await login();
    return { success: true };
  }, [login]);

  const loginWithGoogle = useCallback(async () => {
    await login();
  }, [login]);

  const loginAsDemo = useCallback(async () => {
    await login();
  }, [login]);

  const contextValue: AuthContextType = useMemo(
    () => ({
      isAuthenticated,
      user,
      token: null,
      loading: inProgress !== 'none',
      error: authError,
      isMsalConfigured: true,
      registerUser,
      loginWithCredentials,
      login,
      loginWithGoogle,
      loginAsDemo,
      logout,
      getAccessToken,
    }),
    [isAuthenticated, user, inProgress, authError, registerUser, loginWithCredentials, login, loginWithGoogle, loginAsDemo, logout, getAccessToken]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

/**
 * Standard Production & Development Auth Provider.
 * Connects directly to backend /api/auth endpoints for password-based registration and login,
 * while supporting Google Sign-In and 1-click academic demo personas.
 */
export const DEMO_PERSONAS: Record<'student' | 'evaluator' | 'recruiter', AuthUser> = {
  student: {
    id: 'usr-student-001',
    name: 'Alex Mercer',
    email: 'alex.mercer@cloudresume.ai',
    username: 'alex.mercer',
    role: 'Student / Cloud Engineer',
    avatar: 'AM',
  },
  evaluator: {
    id: 'usr-evaluator-002',
    name: 'Prof. H. Sharma',
    email: 'evaluator@university.edu',
    username: 'prof.sharma',
    role: 'Project Evaluator / Professor',
    avatar: 'PS',
  },
  recruiter: {
    id: 'usr-recruiter-003',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@techcloud.io',
    username: 'sarah.j',
    role: 'Senior Technical Recruiter',
    avatar: 'SJ',
  },
};

const DevAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('cloudresume_auth_token');
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('cloudresume_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = Boolean(user);

  const registerUser = useCallback(async (data: RegisterData): Promise<AuthResponseResult> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: data.fullName,
          email: data.email,
          password: data.password,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMessage = body.message || 'Registration failed. Please check your information.';
        setError(errMessage);
        return { success: false, error: errMessage, details: body.details };
      }

      const receivedToken = body.token;
      const apiUser = body.user;
      const authUser: AuthUser = {
        id: apiUser.id,
        name: apiUser.full_name || data.fullName,
        email: apiUser.email,
        username: apiUser.email.split('@')[0],
        role: 'Cloud Candidate',
        avatar: (apiUser.full_name || data.fullName).slice(0, 2).toUpperCase(),
      };

      setToken(receivedToken);
      setUser(authUser);
      try {
        localStorage.setItem('cloudresume_auth_token', receivedToken);
        localStorage.setItem('cloudresume_auth_user', JSON.stringify(authUser));
      } catch {
        // ignore storage error
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error during registration';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithCredentials = useCallback(async (credentials: LoginCredentials): Promise<AuthResponseResult> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          remember_me: credentials.rememberMe ?? true,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMessage = body.message || 'Invalid email or password.';
        setError(errMessage);
        return { success: false, error: errMessage };
      }

      const receivedToken = body.token;
      const apiUser = body.user;
      const authUser: AuthUser = {
        id: apiUser.id,
        name: apiUser.full_name || apiUser.email.split('@')[0],
        email: apiUser.email,
        username: apiUser.email.split('@')[0],
        role: 'Cloud Candidate',
        avatar: (apiUser.full_name || apiUser.email).slice(0, 2).toUpperCase(),
      };

      setToken(receivedToken);
      setUser(authUser);
      try {
        localStorage.setItem('cloudresume_auth_token', receivedToken);
        localStorage.setItem('cloudresume_auth_user', JSON.stringify(authUser));
      } catch {
        // ignore
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error during login';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (userOrType?: string | { email: string; name?: string; role?: string }) => {
    let nextUser: AuthUser = DEMO_PERSONAS.student;
    if (typeof userOrType === 'object' && userOrType?.email) {
      const emailName = userOrType.name || userOrType.email.split('@')[0];
      nextUser = {
        id: `usr-${Date.now()}`,
        name: emailName,
        email: userOrType.email,
        username: emailName.toLowerCase().replace(/\s+/g, '.'),
        role: userOrType.role || 'Member',
        avatar: emailName.slice(0, 2).toUpperCase(),
      };
    } else if (userOrType === 'evaluator') {
      nextUser = DEMO_PERSONAS.evaluator;
    } else if (userOrType === 'recruiter') {
      nextUser = DEMO_PERSONAS.recruiter;
    }
    setUser(nextUser);
    try {
      localStorage.setItem('cloudresume_auth_user', JSON.stringify(nextUser));
    } catch {
      // ignore storage error
    }
  }, []);

  const loginWithGoogle = useCallback(async (customAccount?: { name: string; email: string; avatar?: string }) => {
    const email = customAccount?.email || 'cloud.developer@gmail.com';
    const name = customAccount?.name || 'Google Cloud Developer';
    const avatar = customAccount?.avatar || (name ? name.slice(0, 2).toUpperCase() : 'GD');
    const googleUser: AuthUser = {
      id: `google-${Date.now()}`,
      name,
      email,
      username: email.split('@')[0],
      role: 'Google Cloud Verified',
      avatar,
    };
    setUser(googleUser);
    try {
      localStorage.setItem('cloudresume_auth_user', JSON.stringify(googleUser));
    } catch {
      // ignore
    }
  }, []);

  const loginAsDemo = useCallback(async (persona: 'student' | 'evaluator' | 'recruiter' = 'student') => {
    const selected = DEMO_PERSONAS[persona] || DEMO_PERSONAS.student;
    setUser(selected);
    try {
      localStorage.setItem('cloudresume_auth_user', JSON.stringify(selected));
    } catch {
      // ignore
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {
      // ignore
    }
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('cloudresume_auth_token');
      localStorage.removeItem('cloudresume_auth_user');
    } catch {
      // ignore
    }
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    return token || localStorage.getItem('cloudresume_auth_token');
  }, [token]);

  useEffect(() => {
    setGlobalTokenGetter(getAccessToken);
    setGlobalDevEmailGetter(() =>
      isAuthenticated && user?.email ? user.email : null
    );
    return () => {
      setGlobalTokenGetter(null);
      setGlobalDevEmailGetter(null);
    };
  }, [isAuthenticated, user, getAccessToken]);

  const value: AuthContextType = useMemo(
    () => ({
      isAuthenticated,
      user,
      token,
      loading,
      error,
      isMsalConfigured: false,
      registerUser,
      loginWithCredentials,
      login,
      loginWithGoogle,
      loginAsDemo,
      logout,
      getAccessToken,
    }),
    [
      isAuthenticated,
      user,
      token,
      loading,
      error,
      registerUser,
      loginWithCredentials,
      login,
      loginWithGoogle,
      loginAsDemo,
      logout,
      getAccessToken,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [msalInstance, setMsalInstance] = useState<IPublicClientApplication | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (isMsalConfigured()) {
      getMsalInstance().then((instance) => {
        if (isMounted) {
          setMsalInstance(instance);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, []);

  if (isMsalConfigured()) {
    if (!msalInstance) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    return (
      <MsalProvider instance={msalInstance}>
        <MsalAuthAdapter>{children}</MsalAuthAdapter>
      </MsalProvider>
    );
  }

  return <DevAuthProvider>{children}</DevAuthProvider>;
};

export default AuthProvider;
