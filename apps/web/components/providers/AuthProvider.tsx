"use client";

import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "../../lib/supabase/client";

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    try {
      const supabase = getSupabaseBrowserClient();

      supabase.auth.getSession().then(({ data }) => {
        if (!isMounted) {
          return;
        }

        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (!isMounted) {
          return;
        }

        setSession(nextSession ?? null);
        setUser(nextSession?.user ?? null);
        setLoading(false);
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } catch {
      setLoading(false);
      return undefined;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
    }),
    [loading, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
