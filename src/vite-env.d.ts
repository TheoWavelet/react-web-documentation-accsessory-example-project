// src/vite-env.d.ts — teaches TypeScript which env vars exist
// (autocomplete + type checks)
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_SENTRY_DSN?: string;
}