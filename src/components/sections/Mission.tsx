import Image from "next/image";
import { Check } from "lucide-react";
import { missionImage, values } from "@/data/home";

/**
 * Mission section: humanitarian image next to the mission statement and
 * the three core values of SocialBridge.
 */
export function Mission() {
  return (
    <section
      id="mission"
      aria-labelledby="mission-heading"
      className="py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Image */}
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5">
            <Image
              src={missionImage}
              alt="A group of volunteers organizing donated supplies together"
              fill
              sizes="(min-width:1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          {/* Small highlight card overlapping the photo */}
          <div className="absolute -bottom-6 right-4 max-w-[16rem] rounded-2xl bg-white p-5 shadow-lg ring-1 ring-black/5 sm:right-8">
            <p className="font-heading text-2xl font-bold text-brand-800">
              Since 2019
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Volunteers have run relief work in 25+ cities with zero overhead
              from small donors.
            </p>
          </div>
        </div>

        {/* Copy and values */}
        <div>
          <span className="inline-flex w-fit items-center rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-brand-800 uppercase">
            Our Mission
          </span>

          <h2
            id="mission-heading"
            className="mt-4 font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl"
          >
            Building a Better Tomorrow, Together
          </h2>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            SocialBridge connects compassionate people with meaningful
            opportunities to support poor and underprivileged communities. We
            believe everyone can make a difference through small acts of
            kindness.
          </p>

          <ul className="mt-8 space-y-5">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <li key={value.title} className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-800 ring-1 ring-brand-100">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-semibold text-navy">
                      {value.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex items-center gap-2.5 text-sm font-medium text-brand-800">
            <span className="grid size-6 place-items-center rounded-full bg-brand-800 text-white">
              <Check className="size-3.5" aria-hidden="true" />
            </span>
            100% of donations go directly to the communities we serve
          </div>
        </div>
      </div>
    </section>
  );
}

export default Mission;
