import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Session JWT of the incoming request, or null when nobody is signed in.
 *
 * The jwt plugin's /token endpoint runs behind better-auth's session
 * middleware, which answers with a 401 APIError when there is no session
 * cookie. Public pages (the event details) fetch without a session, so the
 * error means "signed out" here and must not fail the whole render.
 */
export const getTokenServer = async (): Promise<string | null> => {
  try {
    const jwtToken = await auth.api.getToken({
      headers: await headers(),
    });
    return jwtToken?.token ?? null;
  } catch {
    return null;
  }
};
