import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserRole } from "@/lib/types/laundry";
import {
  clearStoredCredentials,
  loadStoredCredentials,
  persistCredentials,
  type StoredSession,
} from "@/lib/auth/auth-storage";

export interface Session {
  userId: string;
  displayName: string;
  role: UserRole;
}

interface SessionContextValue {
  /** True after first load from secure storage (or web localStorage). */
  isHydrated: boolean;
  /** True when a persisted access token exists. */
  isAuthenticated: boolean;
  session: Session | null;
  token: string | null;
  setRole: (role: UserRole) => void;
  setSessionToken: (token: string | null) => void;
  signInCustomer: (
    displayName: string,
    accessToken: string,
    userId?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const roleToSession = (role: UserRole): Session => ({
  userId: "user_demo",
  displayName:
    role === "customer"
      ? "Ana"
      : role === "rider"
        ? "Rider JP"
        : role === "staff"
          ? "Plant lead"
          : "Admin",
  role,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { token: t, session: s } = await loadStoredCredentials();
      if (cancelled) return;
      if (t && s) {
        setToken(t);
        setSession({
          userId: s.userId,
          displayName: s.displayName,
          role: s.role,
        });
      }
      setIsHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = useCallback(async () => {
    await clearStoredCredentials();
    setSession(null);
    setToken(null);
  }, []);

  const signInCustomer = useCallback(
    async (displayName: string, accessToken: string, userId?: string) => {
      const stored: StoredSession = {
        userId: userId ?? "user",
        displayName,
        role: "customer",
      };
      await persistCredentials(accessToken, stored);
      setToken(accessToken);
      setSession({
        userId: stored.userId,
        displayName: stored.displayName,
        role: "customer",
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      isHydrated,
      isAuthenticated: Boolean(token),
      session,
      token,
      setRole: (role: UserRole) => {
        setSession(roleToSession(role));
      },
      setSessionToken: (t: string | null) => {
        setToken(t);
      },
      signInCustomer,
      signOut,
    }),
    [isHydrated, session, token, signInCustomer, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
