import { steps } from "@/data/home";

/**
 * Three-step "How it works" explainer.
 */
export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="bg-brand-50/60 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex w-fit items-center rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-xs font-semibold tracking-wide text-brand-800 uppercase">
            How it works
          </span>
          <h2
            id="how-heading"
            className="mt-4 font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl"
          >
            Start Helping in Three Simple Steps
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Making a difference is easier than you think. Here is how you can get
            involved today.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <li
                key={step.number}
                className="group relative rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-14 place-items-center rounded-2xl bg-brand-800 text-white transition-transform duration-300 group-hover:scale-110">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="font-heading text-5xl font-bold text-brand-100 transition-colors duration-300 group-hover:text-warm-100">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-6 font-heading text-xl font-semibold text-navy">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export default HowItWorks;
