/**
 * Central place for auth-related URLs and feature flags.
 * When the backend adds refresh tokens, flip VITE_AUTH_REFRESH_ENABLED and
 * wire the response parser in authService.handleTokenRefresh().
 */
const rawBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

/**
 * Join `VITE_API_BASE_URL` with a path like `/api/todo/fetch`.
 * If the base already ends with `/api`, strips the duplicate `/api` prefix on the path
 * so `http://localhost:8000/api` + `/api/health` → `http://localhost:8000/api/health`.
 */
export function resolveApiUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const base = rawBase;
  let p = path.startsWith("/") ? path : `/${path}`;
  if (base.endsWith("/api") && p.startsWith("/api/")) {
    p = p.slice(4);
  }
  return base ? `${base}${p}` : p;
}

export const authConfig = {
  get apiBaseUrl() {
    return rawBase;
  },
  /** Relative to apiBaseUrl, e.g. "/api/user/refresh" */
  refreshPath: "/api/user/refresh",
  get refreshEnabled() {
    return import.meta.env.VITE_AUTH_REFRESH_ENABLED === "true";
  },
} as const;
