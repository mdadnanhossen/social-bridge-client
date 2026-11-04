import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroImage, heroStats } from "@/data/home";

/**
 * Hero / banner section.
 * Two-column layout on desktop: headline + CTAs on the left, a humanitarian
 * photo with floating statistic cards on the right.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden">
      {/* Soft background decorations */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/70 to-background"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-warm-100/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 size-96 rounded-full bg-brand-100/60 blur-3xl"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
        {/* Copy */}
        <div className="animate-fade-up">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-800 uppercase">
            <HeartHandshake className="size-3.5" aria-hidden="true" />
            Community-driven charity platform
          </span>

          <h1
            id="hero-heading"
            className="mt-6 font-heading text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-6xl lg:leading-[1.1]"
          >
            Together, We Can{" "}
            <span className="relative whitespace-nowrap text-brand-800">
              Make a Difference
              <svg
                aria-hidden="true"
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-2.5 w-full text-warm-500"
              >
                <path
                  d="M2 8.5C60 3.5 150 1.5 298 5.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Small acts of kindness can change lives. Join SocialBridge and become
            part of a community dedicated to helping people in need.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              render={<Link href="/upcoming-events" />}
              className="group h-12 rounded-full px-7 text-base"
            >
              Explore Events
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Button>

            <Button
              render={<Link href="#mission" />}
              variant="outline"
              className="h-12 rounded-full border-brand-800/30 px-7 text-base text-brand-800 hover:border-brand-800 hover:bg-brand-50 hover:text-brand-800"
            >
              Start Helping
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
            <Users className="size-4 text-brand-800" aria-hidden="true" />
            Trusted by volunteers across 25+ cities in Bangladesh
          </div>
        </div>

        {/* Image with floating statistic cards */}
        <div className="relative animate-fade-up [animation-delay:150ms]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5">
            <Image
              src={heroImage}
              alt="Volunteers handing a donation box to a family in need"
              fill
              sizes="(min-width:1024px) 50vw, 100vw"
              loading="eager"
              fetchPriority="high"
              className="object-cover"
            />
          </div>

          {/* Floating statistics */}
          <ul className="mt-4 grid grid-cols-3 gap-3 sm:absolute sm:-bottom-6 sm:-left-6 sm:mt-0 sm:grid-cols-1 sm:gap-2">
            {heroStats.map((stat) => (
              <li
                key={stat.label}
                className="animate-float rounded-2xl bg-white/95 px-4 py-3 text-center shadow-lg ring-1 ring-black/5 backdrop-blur-sm sm:flex sm:items-center sm:gap-3 sm:text-left"
              >
                <span className="block font-heading text-xl font-bold text-brand-800 sm:text-lg">
                  {stat.value}
                </span>
                <span className="block text-xs font-medium text-muted-foreground sm:text-sm">
                  {stat.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Hero;
