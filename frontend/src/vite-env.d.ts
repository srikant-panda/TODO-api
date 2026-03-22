/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string | undefined;
  /** When backend adds refresh: set to "true" and implement response shape in authService */
  readonly VITE_AUTH_REFRESH_ENABLED: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
