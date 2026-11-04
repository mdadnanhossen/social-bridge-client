import type { ReactNode } from "react";
import { cn } from "cn";

interface SectionHeadingProps {
  /** Small label above the title, e.g. "Upcoming Events". */
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  /** Use white text for dark sections (e.g. the call to action). */
  tone?: "dark" | "light";
  /** Optional id for the h2, useful for aria-labelledby on sections. */
  headingId?: string;
  className?: string;
  children?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "dark",
  headingId,
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase",
            tone === "dark"
              ? "border-brand-200 bg-brand-50 text-brand-800"
              : "border-white/20 bg-white/10 text-white"
          )}
        >
          {eyebrow}
        </span>
      ) : null}

      <h2
        id={headingId}
        className={cn(
          "font-heading text-3xl font-bold tracking-tight sm:text-4xl",
          tone === "dark" ? "text-navy" : "text-white"
        )}
      >
        {title}
      </h2>

      {description ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed sm:text-lg",
            tone === "dark" ? "text-muted-foreground" : "text-white/80"
          )}
        >
          {description}
        </p>
      ) : null}

      {children}
    </div>
  );
}
