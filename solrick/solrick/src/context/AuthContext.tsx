import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type User = { id: string; name: string };

type AuthContextType = {
  user: User | null;
  signIn: (name: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_KEY = 'solrick.auth.user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const signIn = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Enter a name');
    const id = btoa(unescape(encodeURIComponent(trimmed))).replace(/=+$/,'');
    const u = { id, name: trimmed };
    setUser(u);
    localStorage.setItem(AUTH_KEY, JSON.stringify(u));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  const value = useMemo(() => ({ user, signIn, signOut }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
