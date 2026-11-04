import Image from "next/image";
import Link from "next/link";
import { MapPin, CalendarDays, Users, ArrowRight } from "lucide-react";
import type { EventItem } from "@/types";

interface EventCardProps {
  event: EventItem;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Event thumbnail */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <span className="absolute top-4 left-4 rounded-full bg-warm-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          {event.category}
        </span>
      </div>

      {/* Event information */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-xl font-semibold text-navy transition-colors group-hover:text-brand-800">
          {event.title}
        </h3>

        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-brand-800" aria-hidden="true" />
            {event.location}
          </li>

          <li className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-brand-800" aria-hidden="true" />
            {event.date}
          </li>

          <li className="flex items-center gap-2">
            <Users className="size-4 shrink-0 text-brand-800" aria-hidden="true" />
            {event.volunteers} volunteers joined
          </li>
        </ul>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
          {event.description}
        </p>

        {/* Placeholder link — real event pages come with the events feature */}
        <Link
          href={`/upcoming-events/${event.id}`}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-800 py-2.5 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-800 hover:text-white"
        >
          View Details
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
