import Image from "next/image";
import { cn } from "cn";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { gallery } from "@/data/home";
import type { GalleryLayout } from "@/types";

/** Column spans for each layout variant, per breakpoint. */
const layoutClasses: Record<GalleryLayout, string> = {
  large: "col-span-2 row-span-2",
  wide: "col-span-2",
  normal: "col-span-1",
};

/**
 * Photo gallery of past events in a modern bento-style grid.
 */
export function Gallery() {
  return (
    <section aria-labelledby="gallery-heading" className="bg-brand-50/60 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          headingId="gallery-heading"
          eyebrow="Gallery"
          title="Moments of Kindness"
          description="A look back at the people, smiles and memories created by our volunteer community."
        />

        <ul className="mt-12 grid auto-rows-[10rem] grid-cols-4 gap-4 sm:auto-rows-[12rem] lg:auto-rows-[13rem]">
          {gallery.map((item) => (
            <li
              key={item.caption}
              className={cn(
                "group relative overflow-hidden rounded-2xl ring-1 ring-black/5",
                layoutClasses[item.layout]
              )}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Caption overlay */}
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-4 opacity-90 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-sm font-semibold text-white">
                  {item.caption}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Gallery;
