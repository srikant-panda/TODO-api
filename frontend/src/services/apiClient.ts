import { resolveApiUrl } from "./authConfig";
import { getAccessToken, handleTokenRefresh, logout } from "./authSession";
import type { ApiErrorBody } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export type RequestConfig = {
  path: string;
  method?: string;
  headers?: HeadersInit;
  /** Skip Authorization header (login, signup, public routes) */
  skipAuth?: boolean;
  /** Query params appended to path */
  searchParams?: Record<string, string | number | boolean | undefined>;
  /**
   * If true, a 401 will not trigger refresh/retry.
   */
  skipRefreshOnUnauthorized?: boolean;
  /** Plain objects are JSON-serialized; FormData/Blob/string pass through */
  body?: unknown;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
};

function buildUrl(path: string, searchParams?: RequestConfig["searchParams"]) {
  const applySearch = (url: URL) => {
    if (searchParams) {
      for (const [k, v] of Object.entries(searchParams)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }
  };

  const combined = resolveApiUrl(path);
  const url = new URL(combined, window.location.origin);
  applySearch(url);
  return url.toString();
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer
  ) {
    return body;
  }
  return JSON.stringify(body);
}

function parseErrorMessage(status: number, json: unknown): string {
  if (json && typeof json === "object") {
    const j = json as ApiErrorBody & { detail?: unknown };
    if (typeof j.msg === "string") return j.msg;
    if (typeof j.detail === "string") return j.detail;
    if (Array.isArray(j.detail) && j.detail[0] && typeof j.detail[0] === "object") {
      const first = j.detail[0] as { msg?: string };
      if (typeof first.msg === "string") return first.msg;
    }
    if (j.detail && typeof j.detail === "object" && "msg" in j.detail) {
      const d = j.detail as { msg?: string };
      if (typeof d.msg === "string") return d.msg;
    }
  }
  if (typeof json === "string" && json.trim()) return json;
  return `Request failed (${status})`;
}

/**
 * Core HTTP layer: attaches access token, normalizes errors, and on 401
 * runs handleTokenRefresh() then retries the request once.
 */
export async function request<T>(config: RequestConfig): Promise<T> {
  return performRequest<T>(config, 0);
}

async function performRequest<T>(config: RequestConfig, attempt: 0 | 1): Promise<T> {
  const {
    path,
    searchParams,
    skipAuth,
    skipRefreshOnUnauthorized,
    body: rawBody,
    method = "GET",
    headers: initHeaders,
    signal,
    credentials,
  } = config;

  const url = buildUrl(path, searchParams);
  const headers = new Headers(initHeaders);
  const body = serializeBody(rawBody);

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (
    body !== undefined &&
    !(body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body,
      signal,
      credentials,
    });
  } catch (cause) {
    throw new ApiError(
      "Cannot reach the API. Start the backend (e.g. uvicorn on port 8000) or check the proxy.",
      0,
      cause,
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const parsed: unknown = isJson ? await res.json().catch(() => null) : await res.text();

  if (res.ok) {
    return parsed as T;
  }

  // FastAPI OAuth2PasswordBearer often returns 403 when Authorization is missing;
  // treat like 401 so we clear session / retry refresh consistently.
  const unauthorized = res.status === 401 || res.status === 403;
  if (
    unauthorized &&
    attempt === 0 &&
    !skipAuth &&
    !skipRefreshOnUnauthorized
  ) {
    const refreshed = await handleTokenRefresh();
    if (refreshed) {
      return performRequest<T>(config, 1);
    }
    logout();
  }

  const message = parseErrorMessage(res.status, parsed);
  throw new ApiError(message, res.status, parsed);
}
