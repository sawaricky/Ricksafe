// src/context/AuthContext.tsx
// --------------------------
// Handles user session state (sign-in / sign-out).
// Now also stores the active user's password in memory.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type User = { id: string; name: string };

type AuthContextType = {
  user: User | null;
  password: string | null;
  signIn: (name: string, password: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'solrick.auth.user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore corrupted data
    }
  }, []);

  const signIn = (name: string, passwordValue: string) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Enter a name');

    const id = btoa(unescape(encodeURIComponent(trimmed))).replace(/=+$/, '');
    const u = { id, name: trimmed };

    setUser(u);
    setPassword(passwordValue);
    localStorage.setItem(AUTH_KEY, JSON.stringify(u));
  };

  const signOut = () => {
    setUser(null);
    setPassword(null);
    localStorage.removeItem(AUTH_KEY);
  };

  const value = useMemo(
    () => ({ user, password, signIn, signOut }),
    [user, password]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
