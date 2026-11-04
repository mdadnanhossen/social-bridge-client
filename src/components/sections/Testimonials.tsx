import Image from "next/image";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { testimonials } from "@/data/home";

/**
 * Volunteer testimonials with avatars, roles and star ratings.
 */
export function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          headingId="testimonials-heading"
          eyebrow="Testimonials"
          title="What Our Volunteers Say"
          description="Real stories from the people who give their time to help others."
        />

        <ul className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <li
              key={testimonial.name}
              className="flex h-full flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Star rating */}
              <div
                className="flex items-center gap-1"
                role="img"
                aria-label={`${testimonial.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={
                      index < testimonial.rating
                        ? "size-4 fill-warm-500 text-warm-500"
                        : "size-4 text-border"
                    }
                    aria-hidden="true"
                  />
                ))}
              </div>

              <blockquote className="mt-5 flex-1">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </blockquote>

              <div className="mt-6 flex items-center gap-4 border-t border-border pt-6">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-100">
                  <Image
                    src={testimonial.avatar}
                    alt={`Portrait of ${testimonial.name}`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </span>
                <div>
                  <p className="font-heading text-sm font-semibold text-navy">
                    {testimonial.name}
                  </p>
                  <p className="text-xs font-medium text-brand-800">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Testimonials;
