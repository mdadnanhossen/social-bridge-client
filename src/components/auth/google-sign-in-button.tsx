"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

/** The multi-color Google "G" mark. */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/**
 * Absolute http(s) URL, or null for anything else.
 *
 * Guards the OAuth redirect target: a tampered response must not be able to
 * turn `window.location.assign` into a `javascript:`/`data:` navigation.
 */
function toWebUrl(value: string): string | null {
  try {
    const url = new URL(value);

    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

/**
 * "Continue with Google" OAuth button.
 *
 * Redirects to Google's consent screen; better-auth creates the account on
 * the member's first Google sign-in, so it doubles as a sign-up path.
 */
export function GoogleSignInButton({ callbackURL = "/" }: { callbackURL?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);

    const { data, error } = await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });

    if (error) {
      toast.error("Could not continue with Google", {
        description: error.message || "Please try again in a moment.",
      });
      setLoading(false);
      return;
    }

    if (data?.url) {
      const target = toWebUrl(data.url);

      if (target) {
        // Full-page redirect to Google — keep the spinner until we leave.
        window.location.assign(target);
        return;
      }

      setLoading(false);
      toast.error("Could not continue with Google", {
        description: "The sign-in response was not valid. Please try again.",
      });
      return;
    }

    setLoading(false);
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="h-12 w-full gap-2.5 rounded-xl border-border bg-card text-sm font-semibold shadow-xs hover:bg-muted"
    >
      {loading ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
      Continue with Google
    </Button>
  );
}

export default GoogleSignInButton;
