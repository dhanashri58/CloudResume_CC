import { createContext, useContext } from 'react';

export interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  username?: string;
  role?: string;
  avatar?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isMsalConfigured: boolean;
  login: (userOrType?: string | { email: string; name?: string; role?: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: (persona?: 'student' | 'evaluator' | 'recruiter') => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  isMsalConfigured: false,
  login: async () => {},
  loginWithGoogle: async () => {},
  loginAsDemo: async () => {},
  logout: async () => {},
  getAccessToken: async () => null,
});

export const useAuth = () => useContext(AuthContext);


