import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { backend } from '../api/backend';
import { AuthUser, UserRole } from '../types/app';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string;
  login: (phone: string, password: string) => Promise<void>;
  signup: (payload: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    role: UserRole;
  }) => Promise<void>;
  logout: () => void;
  setRolePreview: (role: UserRole) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (phone: string, password: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await backend.login({ phone, password });
      setUser(response.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    role: UserRole;
  }) => {
    setLoading(true);
    setError('');

    try {
      const created = await backend.signup(payload);
      setUser(created);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError('');
  };

  const setRolePreview = useCallback((role: UserRole) => {
    setUser(currentUser => {
      if (!currentUser) {
        return currentUser;
      }

      return { ...currentUser, role };
    });
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, login, signup, logout, setRolePreview }),
    [user, loading, error, setRolePreview],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
