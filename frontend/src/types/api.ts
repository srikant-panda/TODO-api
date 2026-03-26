/** Aligns with backend shared `Base` models where applicable */

export type ApiErrorBody = {
  detail?: unknown;
  msg?: string;
  error?: string;
};

export type JwtSignInResponse = {
  jwt_token: string;
  msg: string;
  user: User;
  /** Present when backend adds refresh-token flow */
  refresh_token?: string | null;
};

/** Future: backend may return alongside access token */
export type TokenPairResponse = {
  access_token: string;
  refresh_token?: string | null;
  expires_in?: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type SignUpResponse = {
  user: User;
  msg: string;
  error?: string | null;
};

export type Todo = {
  id: string;
  description: string;
  catagory: string;
  user_id: string;
  status: string;
  created_at: string;
};

export type TodoOut = { todo: Todo; msg: string };
export type TodoFetch = { fetched_todos: Todo[]; msg: string; email?: string | null };

export type TodoStatus = "todo" | "in-progress" | "done";
