import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { cn } from "cn";

interface LogoProps {
  className?: string;
  /** Use a light wordmark on dark backgrounds (e.g. the footer). */
  tone?: "dark" | "light";
}

export function Logo({ className, tone = "dark" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="SocialBridge home"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs transition-transform duration-300 group-hover:scale-105">
        <HeartHandshake className="size-5" aria-hidden="true" />
      </span>
      <span
        className={cn(
          "font-heading text-xl font-bold tracking-tight",
          tone === "dark" ? "text-navy" : "text-white"
        )}
      >
        Social<span className="text-primary">Bridge</span>
      </span>
    </Link>
  );
}
