"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, CalendarOff, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import EventCardSkeleton from "@/components/shared/EventCardSkeleton";
import { SectionHeading } from "@/components/shared/SectionHeading";
import UpcomingEventCard from "@/components/shared/UpcomingEventCard";
import { useUpcomingEvents } from "@/hooks/use-upcoming-events";

/** Number of placeholder cards shown while the events are loading. */
const SKELETON_CARD_COUNT = 6;

/**
 * Featured upcoming events grid (3 columns on desktop, 2 on tablet, 1 on mobile).
 *
 * Renders the live events returned by the shared useUpcomingEvents hook — the
 * same backend data as the Upcoming Events page — so an event created from
 * the create-event form shows up here as soon as the page loads.
 */
export function FeaturedEvents() {
  const { status, events, errorMessage, retry } = useUpcomingEvents();

  return (
    <section
      id="events"
      aria-labelledby="events-heading"
      className="py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          headingId="events-heading"
          eyebrow="Upcoming Events"
          title="Make an Impact Near You"
          description="Discover meaningful events and find opportunities to help your community."
        />

        <div className="mt-12" aria-busy={status === "loading"}>
          {status === "loading" && (
            <>
              <p className="sr-only" role="status">
                Loading featured events…
              </p>

              <ul
                aria-hidden="true"
                className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
              >
                {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
                  <li key={index} className="h-full">
                    <EventCardSkeleton />
                  </li>
                ))}
              </ul>
            </>
          )}

          {status === "error" && (
            <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl bg-white p-10 text-center shadow-xl ring-1 ring-black/5">
              <span className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertCircle className="size-6" aria-hidden="true" />
              </span>

              <h3 className="font-heading text-xl font-semibold text-navy">
                We couldn&apos;t load the events
              </h3>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {errorMessage ? `${errorMessage} ` : ""}
                Please make sure the backend server is running on port 5000,
                then try again.
              </p>

              <Button onClick={retry} className="mt-2 rounded-full px-6">
                <RotateCcw className="mr-2 size-4" />
                Try Again
              </Button>
            </div>
          )}

          {status === "success" &&
            (events.length === 0 ? (
              <Empty className="min-h-72 rounded-3xl border bg-white shadow-sm">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CalendarOff />
                  </EmptyMedia>

                  <EmptyTitle>No events just yet</EmptyTitle>

                  <EmptyDescription>
                    Nothing is scheduled for today or later right now. New
                    events show up here as soon as organizers create them —
                    check back soon.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {events.slice(0, 6).map((event) => (
                  <li key={event._id} className="h-full">
                    <UpcomingEventCard event={event} />
                  </li>
                ))}
              </ul>
            ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/upcoming-events"
            className="group inline-flex items-center gap-2 rounded-full border border-brand-800/30 px-6 py-3 text-sm font-semibold text-brand-800 transition-colors hover:border-brand-800 hover:bg-brand-50"
          >
            Browse All Events
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedEvents;
