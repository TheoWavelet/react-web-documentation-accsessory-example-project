// src/shared/lib/env.ts
// Vite exposes ONLY variables prefixed with VITE_ to client
// code, by inlining them at build time. Everything in the
// bundle is public — never put secrets here.
import { z } from 'zod';
const schema = z.object({
  VITE_API_URL: z.url().optional(),
  VITE_SENTRY_DSN: z.string().optional(),
})
// Parse once at startup: a missing or malformed variable fails
// loudly in development instead of causing a confusing runtime
// error deep inside the app.
export const env = schema.parse(import.meta.env);