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
import { AuthContext, AuthContextType, AuthUser } from './AuthContext';
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

  const contextValue: AuthContextType = useMemo(
    () => ({
      isAuthenticated,
      user,
      loading: inProgress !== 'none',
      error: authError,
      isMsalConfigured: true,
      login,
      loginWithGoogle: login,
      loginAsDemo: async () => login(),
      logout,
      getAccessToken,
    }),
    [isAuthenticated, user, inProgress, authError, login, logout, getAccessToken]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

/**
 * Fallback Development & Demo Auth Provider used when MSAL environment variables are unconfigured.
 * Supports Google Sign-In simulation, custom credentials, and 1-click evaluator demo personas.
 */
const DEMO_PERSONAS: Record<'student' | 'evaluator' | 'recruiter', AuthUser> = {
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
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('cloudresume_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEMO_PERSONAS.student;
  });

  const isAuthenticated = Boolean(user);

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

  const loginWithGoogle = useCallback(async () => {
    // Simulated Google OAuth profile for GCP deployment
    const googleUser: AuthUser = {
      id: 'google-usr-94821',
      name: 'Google Cloud Developer',
      email: 'cloud.developer@gmail.com',
      username: 'cloud.dev',
      role: 'Google Cloud Verified',
      avatar: 'GD',
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
    setUser(null);
    try {
      localStorage.removeItem('cloudresume_auth_user');
    } catch {
      // ignore
    }
  }, []);

  const getAccessToken = useCallback(async () => null, []);

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
      loading: false,
      error: null,
      isMsalConfigured: false,
      login,
      loginWithGoogle,
      loginAsDemo,
      logout,
      getAccessToken,
    }),
    [isAuthenticated, user, login, loginWithGoogle, loginAsDemo, logout, getAccessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Root AuthProvider that initializes MSAL if configured, or falls back to DevAuthProvider.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pca, setPca] = useState<IPublicClientApplication | null>(null);
  const [initializing, setInitializing] = useState<boolean>(isMsalConfigured());

  useEffect(() => {
    let isMounted = true;
    if (isMsalConfigured()) {
      getMsalInstance()
        .then((instance) => {
          if (isMounted) {
            setPca(instance);
            setInitializing(false);
          }
        })
        .catch((err) => {
          console.error('[MSAL] Failed to initialize MSAL instance:', err);
          if (isMounted) setInitializing(false);
        });
    } else {
      setInitializing(false);
    }
    return () => {
      isMounted = false;
    };
  }, []);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">
            Initializing identity provider...
          </p>
        </div>
      </div>
    );
  }

  if (pca) {
    return (
      <MsalProvider instance={pca}>
        <MsalAuthAdapter>{children}</MsalAuthAdapter>
      </MsalProvider>
    );
  }

  return <DevAuthProvider>{children}</DevAuthProvider>;
};

