import { createContext, useContext } from 'react';

export interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  username?: string;
  role?: string;
  avatar?: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponseResult {
  success: boolean;
  error?: string;
  details?: Record<string, string>;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isMsalConfigured: boolean;
  registerUser: (data: RegisterData) => Promise<AuthResponseResult>;
  loginWithCredentials: (credentials: LoginCredentials) => Promise<AuthResponseResult>;
  login: (userOrType?: string | { email: string; name?: string; role?: string }) => Promise<void>;
  loginWithGoogle: (customAccount?: { name: string; email: string; avatar?: string }) => Promise<void>;
  loginAsDemo: (persona?: 'student' | 'evaluator' | 'recruiter') => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
  isMsalConfigured: false,
  registerUser: async () => ({ success: false, error: 'Auth context not initialized' }),
  loginWithCredentials: async () => ({ success: false, error: 'Auth context not initialized' }),
  login: async () => {},
  loginWithGoogle: async () => {},
  loginAsDemo: async () => {},
  logout: async () => {},
  getAccessToken: async () => null,
});

export const useAuth = () => useContext(AuthContext);
