import Link from "next/link";
import { HeartHandshake } from "lucide-react";

interface AuthShellProps {
 
  title: string;
  /** One-line supporting copy under the headline. */
  subtitle: string;
  /** The form (and anything else) rendered inside the card. */
  children: React.ReactNode;
}

/**
 * Shared shell for the auth pages (/login, /signup).
 *
 * Renders a single centered form card over a soft brand-tinted backdrop;
 * all decoration is pure CSS so the pages stay fast and consistent with
 * the SocialBridge palette.
 */
export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <section className="relative flex items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:py-20">
      {/* Soft brand-tinted backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(22,101,52,0.07),transparent)]" />
        <div className="absolute -left-24 top-24 size-72 animate-float rounded-full bg-brand-100/70 blur-3xl" />
        <div className="absolute -right-20 bottom-0 size-80 animate-float rounded-full bg-warm-100/70 blur-3xl [animation-delay:2s]" />
      </div>

      {/* Form card */}
      <div className="w-full max-w-md animate-fade-up">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-7 shadow-[0_28px_60px_-28px_rgba(15,23,42,0.3)] sm:p-9">
          <span
            aria-hidden="true"
            className="absolute inset-x-8 top-0 h-1.5 rounded-b-full bg-gradient-to-r from-brand-600 via-brand-800 to-warm-500"
          />

          <header className="mb-8 pt-4 text-center">
            <span className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-brand-800 text-white shadow-lg shadow-brand-800/30">
              <HeartHandshake className="size-7" />
            </span>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-navy">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          </header>

          {children}
        </div>

        <p className="mx-auto mt-6 max-w-sm px-2 text-center text-xs leading-relaxed text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link
            href="#"
            className="font-medium text-brand-800 underline-offset-4 hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className="font-medium text-brand-800 underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

export default AuthShell;
