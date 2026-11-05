"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, Mail, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { contactInfo } from "@/data/home";
import { authClient } from "@/lib/auth-client";

/**
 * Where to land after signing in, from `?callbackUrl=`.
 *
 * Only same-site absolute paths are honoured (`/upcoming-events/…`), so a
 * crafted link cannot bounce members off-site right after authenticating.
 * Anything else falls back to the home page.
 */
function safeCallbackUrl(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";

  return value;
}

/**
 * Login page — signs in with better-auth (email + password) or Google.
 * Apple sign-in is intentionally not offered.
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim() !== "" && password !== "" && !submitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    const { data, error: signInError } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setSubmitting(false);
      const message =
        signInError.message || "Invalid email or password. Please try again.";
      setError(message);
      toast.error("Could not sign you in", { description: message });
      return;
    }

    toast.success(
      `Welcome back${data?.user.name ? `, ${data.user.name.split(" ")[0]}` : ""}!`,
      { description: "Great to see you again." }
    );
    router.push(callbackUrl);
    router.refresh();
  }

  function handleForgotPassword() {
    // A real reset flow needs an email provider — nudge people to support for now.
    toast.info("Password reset isn't set up yet", {
      description: `Please contact ${contactInfo.email} and we'll help you back in.`,
    });
  }

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to organize and join community drives"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-destructive"
          >
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="email" className="text-sm font-semibold text-navy">
              Email
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-semibold text-brand-800 underline-offset-4 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="email"
              type="email"
              value={email}
              onValueChange={setEmail}
              placeholder="name@example.com"
              autoComplete="email"
              required
              className="h-12 rounded-xl border-border bg-muted/50 pl-10 text-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-navy">
            Password
          </label>
          <PasswordInput
            id="password"
            value={password}
            onValueChange={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={!canSubmit}
          className="group h-12 w-full gap-2 rounded-xl bg-brand-800 text-sm font-semibold text-white shadow-lg shadow-brand-800/20 hover:bg-brand-900"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" />
              Signing you in…
            </>
          ) : (
            <>
              Sign In
              <ArrowRight
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              or continue with
            </span>
          </div>
        </div>

        <GoogleSignInButton callbackURL={callbackUrl} />

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-brand-800 underline-offset-4 hover:underline"
          >
            Register here
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

/**
 * `useSearchParams` needs a Suspense boundary or the production build
 * fails this route's prerender, so the form is mounted underneath one.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
