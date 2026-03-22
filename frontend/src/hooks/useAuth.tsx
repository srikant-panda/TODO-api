import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  isAuthenticated,
  logout as logoutSession,
  signIn as signInRequest,
  signUp as signUpRequest,
  subscribeAuth,
} from "@/services/authService";
import type { SignInCredentials, SignUpPayload } from "@/services/authService";
import type { SignUpResponse } from "@/types/api";

type AuthContextValue = {
  isAuthenticated: boolean;
  signIn: (c: SignInCredentials) => Promise<void>;
  signUp: (p: SignUpPayload) => Promise<SignUpResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const authed = useSyncExternalStore(
    subscribeAuth,
    isAuthenticated,
    () => false,
  );

  const handleLogout = useCallback(() => {
    logoutSession();
    navigate("/", { replace: true });
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: authed,
      signIn: async (c) => {
        await signInRequest(c);
        navigate("/tasks", { replace: true });
      },
      signUp: signUpRequest,
      logout: handleLogout,
    }),
    [authed, handleLogout, navigate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
