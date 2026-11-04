import { Configuration, LogLevel, PublicClientApplication } from '@azure/msal-browser';

/**
 * Checks if Microsoft Entra External ID environment variables are populated.
 */
export const isMsalConfigured = (): boolean => {
  const clientId = import.meta.env.VITE_AZURE_ENTRA_CLIENT_ID;
  const authority = import.meta.env.VITE_AZURE_ENTRA_AUTHORITY;

  return Boolean(
    clientId &&
      authority &&
      !clientId.includes('placeholder') &&
      !authority.includes('placeholder')
  );
};

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_ENTRA_CLIENT_ID || 'placeholder-client-id',
    authority:
      import.meta.env.VITE_AZURE_ENTRA_AUTHORITY ||
      'https://login.microsoftonline.com/common',
    redirectUri:
      import.meta.env.VITE_AZURE_ENTRA_REDIRECT_URI ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'),
    postLogoutRedirectUri:
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error('[MSAL]', message);
            return;
          case LogLevel.Warning:
            console.warn('[MSAL]', message);
            return;
          default:
            return;
        }
      },
      logLevel: LogLevel.Warning,
    },
  },
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};

export const getApiTokenRequest = () => {
  const customScope = import.meta.env.VITE_AZURE_ENTRA_API_SCOPE;

  if (
    !customScope ||
    customScope.trim() === '' ||
    customScope.includes('placeholder')
  ) {
    throw new Error(
      "Missing required configuration: 'VITE_AZURE_ENTRA_API_SCOPE' must be explicitly configured when Microsoft Entra authentication is enabled (e.g. 'api://<backend-api-client-id>/access_as_user')."
    );
  }

  return {
    scopes: [customScope.trim()],
  };
};

/**
 * Singleton PublicClientApplication instance initialized conditionally.
 */
let pcaInstance: PublicClientApplication | null = null;

export const getMsalInstance = async (): Promise<PublicClientApplication | null> => {
  if (!isMsalConfigured()) {
    return null;
  }
  if (!pcaInstance) {
    pcaInstance = new PublicClientApplication(msalConfig);
    await pcaInstance.initialize();
  }
  return pcaInstance;
};
