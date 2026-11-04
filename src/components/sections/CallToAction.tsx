import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Full-width call to action encouraging visitors to volunteer.
 */
export function CallToAction() {
  return (
    <section aria-labelledby="cta-heading" className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-800 px-6 py-16 shadow-xl sm:px-12 sm:py-20 lg:px-20">
          {/* Decorative accents */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-warm-500/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-white/10 text-warm-500 ring-1 ring-white/20">
              <HeartHandshake className="size-8" aria-hidden="true" />
            </span>

            <h2
              id="cta-heading"
              className="mt-6 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              Your Kindness Can Change Someone&apos;s Life
            </h2>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Be the reason someone smiles today. Join SocialBridge and start
              making a difference.
            </p>

            <Button
              render={<Link href="/signup" />}
              className="group mt-8 h-14 rounded-full bg-warm-500 px-9 text-base font-semibold text-white shadow-lg hover:bg-warm-600 hover:text-white"
            >
              Become a Volunteer
              <ArrowRight
                className="size-5 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Button>

            <p className="mt-4 text-sm text-white/60">
              Free to join &middot; No experience needed &middot; Make an impact
              from day one
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CallToAction;
