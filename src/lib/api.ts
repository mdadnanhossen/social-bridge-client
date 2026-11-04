/**
 * Base URL of the social-bridge backend (see social-bridge-server/index.js).
 *
 * `NEXT_PUBLIC_API_URL` is the single source of truth for the API origin: set
 * it to the deployed origin (see .env.example) to point every request in the
 * app at production without touching call sites — hardcoding the host in each
 * file is what made the client impossible to deploy elsewhere (and what
 * forced plain `http://` in production). Only development falls back to the
 * backend's default port when the variable is unset; a production build never
 * calls localhost — an unset variable resolves to same-origin requests, so a
 * missing variable shows up as errors instead of requests to the visitor's
 * own machine.
 */

const configured =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV !== "production" ? "http://localhost:5000" : "");

/** API origin without a trailing slash. */
export const API_BASE_URL = configured.replace(/\/+$/, "");

/** Joins the API origin with a path, e.g. `apiUrl("/create-event")`. */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
