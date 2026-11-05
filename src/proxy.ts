import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "./lib/auth";

/**
 * Routes that need a signed-in user. The event detail page behind every
 * "View Details" link is deliberately public — anyone may read it; only the
 * join action itself checks the session on the client. `/profile` and
 * `/dashboard` carry personal data, so they are gated here as well — their
 * own client-side checks are only a second line of defence.
 */
const PROTECTED_PREFIXES = [
  "/profile",
  "/dashboard",
  "/joined-events",
  "/create-event",
  "/manage-events",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix)
  );
}

/**
 * Optimistic auth gate for the signed-in-only pages. The session is validated
 * by better-auth (cookie -> database) and unauthenticated visitors are sent to
 * /login; the pages keep their own client-side checks as a second line.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Routes Proxy should run on — exact paths plus subpaths. The whole
// /upcoming-events tree stays out of it: the list and the detail page are
// both public.
export const config = {
  matcher: [
    "/profile/:path*",
    "/dashboard/:path*",
    "/joined-events/:path*",
    "/create-event/:path*",
    "/manage-events/:path*",
  ],
};
