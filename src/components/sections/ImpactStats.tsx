import { impactStats } from "@/data/home";

/**
 * Impact statistics band with four animated cards.
 */
export function ImpactStats() {
  return (
    <section aria-labelledby="impact-heading" className="bg-brand-900 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="impact-heading"
            className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Our Impact So Far
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
            Every number represents a real life touched by the generosity of our
            volunteers and donors.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {impactStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <li
                key={stat.label}
                className="group rounded-2xl bg-white/[0.07] p-8 text-center ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.12] hover:ring-warm-500/50"
              >
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/10 text-warm-500 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="size-7" aria-hidden="true" />
                </span>

                <p className="mt-5 font-heading text-4xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-sm font-medium text-white/70">
                  {stat.label}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default ImpactStats;
