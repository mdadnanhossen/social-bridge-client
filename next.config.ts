import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/** Origin of an env-provided URL, or null when unset/unparseable. */
function originOf(value: string | undefined): string | null {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * Origins the browser is allowed to talk to. The events API origin comes from
 * `NEXT_PUBLIC_API_URL` (see `src/lib/api.ts`, which falls back to
 * localhost:5000 in development only), and the better-auth client may live on
 * its own origin, so both are allow-listed on top of the app's own origin.
 */
const connectOrigins = new Set<string>(
  [
    originOf(
      process.env.NEXT_PUBLIC_API_URL ||
        (isDev ? "http://localhost:5000" : "")
    ),
    originOf(process.env.NEXT_PUBLIC_BETTER_AUTH_URL),
  ].filter((origin): origin is string => origin !== null)
);

/**
 * Content Security Policy.
 *
 * Next.js renders its bootstrap/flight payload as inline <script> tags and
 * injects styles at runtime, so both need 'unsafe-inline'; what this still
 * buys over no policy at all is that remote <script src>, <object>, <base>
 * and framed embedding are all blocked, and every request has to target an
 * origin we listed. A nonce-based policy would be stricter, but it requires
 * per-request plumbing that is incompatible with the statically prerendered
 * pages in this app (see `cacheComponents`).
 *
 * Dev additionally allows eval (React refresh) and websockets (Turbopack
 * HMR) so `next dev` keeps working.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Event thumbnails and avatars come from organizer-controlled hosts, and
  // avatars may be data URIs.
  "img-src 'self' data: blob: https: http:",
  "font-src 'self' data:",
  `connect-src 'self' ${[...connectOrigins].join(" ")}` +
    (isDev ? " ws://localhost:* ws://127.0.0.1:*" : ""),
  "media-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

/** Headers applied to every response the app serves. */
const securityHeaders = [
  // Never advertise the framework.
  { key: "X-Powered-By", value: "" },
  // Stop the browser from MIME-sniffing a response into an executable type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // The app is a single-document UI — nothing should frame it (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Stop referrers leaking full URLs (paths can contain ids) off-site.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Only the camera/mic/geo the app never uses.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // Legacy XSS auditor is deprecated and has itself been exploited; keep it
  // off rather than trusting it.
  { key: "X-XSS-Protection", value: "0" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  // Browsers only honour this over an HTTPS connection, so sending it while
  // developing on http://localhost is a harmless no-op.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    // Allow next/image optimization for the Unsplash photos used across the
    // homepage (hero, events, gallery, testimonials).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
