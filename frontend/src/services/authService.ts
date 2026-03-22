import type { JwtSignInResponse, SignUpResponse } from "@/types/api";
import { ApiError, request } from "./apiClient";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  isAuthenticated,
  logout,
  setSessionTokens,
  subscribeAuth,
} from "./authSession";

export type SignInCredentials = { email: string; password: string };

export type SignUpPayload = {
  name: string;
  email: string;
  password: string;
  role?: string;
};

/**
 * Auth API + session helpers. Token storage and refresh mechanics live in
 * `authSession.ts`; HTTP retry/401 handling lives in `apiClient.ts`.
 */
export async function signIn(credentials: SignInCredentials): Promise<void> {
  const data = await request<JwtSignInResponse>({
    path: "/api/user/signin",
    method: "POST",
    skipAuth: true,
    body: credentials,
  });

  setSessionTokens({
    accessToken: data.jwt_token,
    refreshToken: data.refresh_token ?? null,
  });
}

export async function signUp(payload: SignUpPayload): Promise<SignUpResponse> {
  return request<SignUpResponse>({
    path: "/api/user/signup",
    method: "POST",
    skipAuth: true,
    body: {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role ?? "user",
    },
  });
}

export {
  clearSession,
  getAccessToken,
  getRefreshToken,
  isAuthenticated,
  logout,
  setSessionTokens,
  subscribeAuth,
};

export function getAuthErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}
