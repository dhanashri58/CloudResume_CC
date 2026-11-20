import { isMsalConfigured } from '../auth/msalConfig';

/**
 * Global authentication credentials bridge for HTTP API client requests.
 */

type TokenGetter = () => Promise<string | null>;
type DevEmailGetter = () => string | null;

let globalTokenGetter: TokenGetter | null = null;
let globalDevEmailGetter: DevEmailGetter | null = null;

export const setGlobalTokenGetter = (getter: TokenGetter | null) => {
  globalTokenGetter = getter;
};

export const setGlobalDevEmailGetter = (getter: DevEmailGetter | null) => {
  globalDevEmailGetter = getter;
};

/**
 * Check whether development authentication headers should be used.
 * Strictly false in production or when Microsoft Entra is configured.
 */
export const isDevAuthEnabled = (): boolean => {
  if (import.meta.env.PROD || import.meta.env.MODE === 'production') {
    return false;
  }
  if (isMsalConfigured()) {
    return false;
  }
  const flag = import.meta.env.VITE_DEV_AUTH_ENABLED;
  if (flag !== undefined && flag !== '') {
    return flag === 'true' || flag === '1';
  }
  return true;
};

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  // 1. Bearer Token via registered getter
  if (globalTokenGetter) {
    try {
      const token = await globalTokenGetter();
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    } catch (err) {
      console.warn('[AuthToken] Failed to acquire token for outgoing request:', err);
    }
  }

  // 2. Direct localStorage Token Fallback (handles immediate post-login queries and page reloads)
  try {
    const localToken = localStorage.getItem('cloudresume_auth_token');
    if (localToken) {
      return { Authorization: `Bearer ${localToken}` };
    }
  } catch {
    // ignore storage access errors
  }

  // 3. Development Authentication Fallback (strictly guarded)
  if (isDevAuthEnabled() && globalDevEmailGetter) {
    try {
      const devEmail = globalDevEmailGetter();
      if (devEmail) {
        return { 'X-Dev-User-Email': devEmail };
      }
    } catch (err) {
      console.warn('[AuthToken] Failed to retrieve dev user email:', err);
    }
  }

  return {};
};
