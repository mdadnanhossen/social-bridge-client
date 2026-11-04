"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Image as ImageIcon,
  Loader2,
  Mail,
  TriangleAlert,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "cn";

/** Password rules validated live under the password field. */
const passwordRules = [
  { label: "At least one uppercase letter (A-Z)", test: (v: string) => /[A-Z]/.test(v) },
  { label: "At least one lowercase letter (a-z)", test: (v: string) => /[a-z]/.test(v) },
  // Kept in sync with `minPasswordLength` in src/lib/auth.ts.
  { label: "Minimum 8 characters length", test: (v: string) => v.length >= 8 },
];

/** Profile photos must be a real HTTPS URL — the avatar is rendered as-is. */
function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const inputClass = "h-12 rounded-xl border-border bg-muted/50 pl-10 text-sm";

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-navy">
      {children}
    </label>
  );
}

/**
 * Register page — creates an account through better-auth (email + password).
 * Google sign-up lives on the login page; Apple sign-in is intentionally
 * not offered anywhere.
 */
export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ruleResults = useMemo(
    () => passwordRules.map((rule) => rule.test(password)),
    [password]
  );
  const passwordValid = ruleResults.every(Boolean);

  // Reject anything that is not an absolute https URL before it is stored on
  // the user record and later rendered as the avatar.
  const trimmedImage = image.trim();
  const imageValid = trimmedImage === "" || isHttpsUrl(trimmedImage);

  const canSubmit =
    name.trim().length >= 2 &&
    email.trim() !== "" &&
    imageValid &&
    passwordValid &&
    !submitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    const { data, error: signUpError } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
      image: image.trim() || undefined,
    });

    if (signUpError) {
      setSubmitting(false);
      const raw = signUpError.message ?? "";
      const message = /already exists/i.test(raw)
        ? "An account with this email already exists — try logging in instead."
        : raw || "Something went wrong. Please try again.";
      setError(message);
      toast.error("Could not create your account", { description: message });
      return;
    }

    toast.success(
      `Welcome aboard${data?.user.name ? `, ${data.user.name.split(" ")[0]}` : ""}!`,
      { description: "Your account is ready — let's make a difference together." }
    );
    router.push("/");
    router.refresh();
  }

  return (
    <AuthShell
      title="Create Account"
      subtitle="Join the community and start driving social change"
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

        {/* Full name */}
        <div className="space-y-2">
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <div className="relative">
            <User
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="name"
              value={name}
              onValueChange={setName}
              placeholder="Tanvir Ahmed"
              autoComplete="name"
              required
              className={inputClass}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <FieldLabel htmlFor="email">Email Address</FieldLabel>
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
              className={inputClass}
            />
          </div>
        </div>

        {/* Profile photo (optional) */}
        <div className="space-y-2">
          <FieldLabel htmlFor="image">Profile Photo URL</FieldLabel>
          <div className="relative">
            <ImageIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="image"
              type="url"
              value={image}
              onValueChange={setImage}
              placeholder="https://images.unsplash.com/..."
              autoComplete="url"
              className={inputClass}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Optional — leave empty for the default avatar.
          </p>
          {trimmedImage !== "" && !imageValid && (
            <p className="text-xs text-destructive">
              Please enter a full <code>https://</code> image URL.
            </p>
          )}
        </div>

        {/* Password + live rules */}
        <div className="space-y-2">
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput
            id="password"
            value={password}
            onValueChange={setPassword}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
          <ul className="grid gap-1.5 pt-1">
            {passwordRules.map((rule, index) => {
              const passed = ruleResults[index];
              return (
                <li
                  key={rule.label}
                  className={cn(
                    "flex items-center gap-2 text-xs font-medium transition-colors",
                    passed ? "text-brand-700" : "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-full transition-colors",
                      passed
                        ? "bg-brand-800 text-white"
                        : "bg-muted text-muted-foreground ring-1 ring-border"
                    )}
                  >
                    {passed ? (
                      <Check className="size-2.5" strokeWidth={3} />
                    ) : (
                      <X className="size-2.5" strokeWidth={3} />
                    )}
                  </span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
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
              Creating your account…
            </>
          ) : (
            <>
              Register
              <ArrowRight
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-800 underline-offset-4 hover:underline"
          >
            Login here
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
