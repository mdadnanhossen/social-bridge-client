"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import { parseEventDate, type DonationEvent } from "@/lib/events";

/**
 * A single upcoming event card, shared by the homepage's FeaturedEvents
 * section and the Upcoming Events page so both render real events with the
 * same layout.
 */
export function UpcomingEventCard({ event }: { event: DonationEvent }) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  const eventDate = parseEventDate(event.date);
  const hasThumbnail = Boolean(event.thumbnail) && !thumbnailFailed;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Event thumbnail */}
      <div className="relative h-52 overflow-hidden bg-muted">
        {hasThumbnail ? (
          <img
            src={event.thumbnail}
            alt={`${event.title} thumbnail`}
            loading="lazy"
            onError={() => setThumbnailFailed(true)}
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex size-full items-center justify-center bg-brand-50"
          >
            <CalendarDays className="size-8 text-brand-800/40" />
          </div>
        )}

        <span className="absolute top-4 left-4 rounded-full bg-warm-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          {event.type || "Community Event"}
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
            {event.location || "Location to be announced"}
          </li>

          <li className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-brand-800" aria-hidden="true" />
            {eventDate ? format(eventDate, "MMM dd, yyyy") : "Date to be announced"}
          </li>
        </ul>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
          {event.description || "More details about this event will be shared soon."}
        </p>

        {/* Details live on the dynamic /upcoming-events/[id] route */}
        <Link
          href={`/upcoming-events/${event._id}`}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-800 py-2.5 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-800 hover:text-white"
        >
          View Details
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}

export default UpcomingEventCard;
