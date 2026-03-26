import type { JwtSignInResponse, TokenPairResponse, User } from "@/types/api";
import { authConfig, resolveApiUrl } from "./authConfig";

const LS_ACCESS = "todo_api_access_token";
const LS_REFRESH = "todo_api_refresh_token";
const LS_USER = "todo_api_user";

/**
 * Single source of truth for session tokens.
 */
let accessToken: string | null = null;
let refreshToken: string | null = null;
let user: User | null = null;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function readStorage(): void {
  if (typeof window === "undefined") return;
  try {
    accessToken = localStorage.getItem(LS_ACCESS);
    refreshToken = localStorage.getItem(LS_REFRESH);
    const savedUser = localStorage.getItem(LS_USER);
    if (savedUser) {
      user = JSON.parse(savedUser);
    }
  } catch {
    /* private mode / disabled storage */
  }
}

function writeStorage(): void {
  if (typeof window === "undefined") return;
  try {
    if (accessToken) {
      localStorage.setItem(LS_ACCESS, accessToken);
    } else {
      localStorage.removeItem(LS_ACCESS);
    }
    if (refreshToken) {
      localStorage.setItem(LS_REFRESH, refreshToken);
    } else {
      localStorage.removeItem(LS_REFRESH);
    }
    if (user) {
      localStorage.setItem(LS_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(LS_USER);
    }
  } catch {
    /* quota */
  }
}

readStorage();

export function subscribeAuth(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function getUser(): User | null {
  return user;
}

export function isAuthenticated(): boolean {
  return Boolean(accessToken);
}

/**
 * Apply tokens after login or a successful refresh.
 * Backend may later send refresh_token — we store it when present.
 */
export function setSessionTokens(tokens: {
  accessToken: string;
  refreshToken?: string | null;
  user?: User | null;
}) {
  accessToken = tokens.accessToken;
  if (tokens.refreshToken !== undefined) {
    refreshToken = tokens.refreshToken;
  }
  if (tokens.user !== undefined) {
    user = tokens.user;
  }
  writeStorage();
  emit();
}

export function clearSession() {
  accessToken = null;
  refreshToken = null;
  user = null;
  writeStorage();
  emit();
}

export function logout() {
  clearSession();
}

/**
 * Attempt to recover a valid access token without user interaction.
 * - Today: no refresh endpoint → clear session and return false.
 * - Future: POST refresh token → new access (and optionally new refresh) → return true.
 */
let refreshInFlight: Promise<boolean> | null = null;

export async function handleTokenRefresh(): Promise<boolean> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    if (!authConfig.refreshEnabled) {
      clearSession();
      return false;
    }

    const rt = refreshToken;
    if (!rt) {
      clearSession();
      return false;
    }

    const url = resolveApiUrl(authConfig.refreshPath);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ refresh_token: rt }),
      });

      if (!res.ok) {
        clearSession();
        return false;
      }

      const data = (await res.json()) as TokenPairResponse | JwtSignInResponse;

      if ("access_token" in data && data.access_token) {
        setSessionTokens({
          accessToken: data.access_token,
          refreshToken: data.refresh_token ?? null,
        });
        return true;
      }

      if ("jwt_token" in data && data.jwt_token) {
        setSessionTokens({
          accessToken: data.jwt_token,
          refreshToken: null,
        });
        return true;
      }

      clearSession();
      return false;
    } catch {
      clearSession();
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}
