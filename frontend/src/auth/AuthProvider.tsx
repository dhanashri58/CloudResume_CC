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
      logout,
      getAccessToken,
    }),
    [isAuthenticated, user, inProgress, authError, login, logout, getAccessToken]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

/**
 * Fallback Development Auth Provider used when MSAL environment variables are unconfigured.
 */
const DevAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [user, setUser] = useState<AuthUser | null>({
    id: 'dev-user-001',
    name: 'Alex Mercer',
    email: 'alex.mercer@cloudresume.ai',
    username: 'alex.mercer',
  });

  const login = async () => {
    setIsAuthenticated(true);
    setUser({
      id: 'dev-user-001',
      name: 'Alex Mercer',
      email: 'alex.mercer@cloudresume.ai',
      username: 'alex.mercer',
    });
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const getAccessToken = async () => null;

  useEffect(() => {
    setGlobalTokenGetter(getAccessToken);
    setGlobalDevEmailGetter(() =>
      isAuthenticated && user?.email ? user.email : null
    );
    return () => {
      setGlobalTokenGetter(null);
      setGlobalDevEmailGetter(null);
    };
  }, [isAuthenticated, user]);

  const value: AuthContextType = useMemo(
    () => ({
      isAuthenticated,
      user,
      loading: false,
      error: null,
      isMsalConfigured: false,
      login,
      logout,
      getAccessToken,
    }),
    [isAuthenticated, user]
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

