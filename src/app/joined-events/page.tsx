"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  HeartHandshake,
  MapPin,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { useJoinedEvents } from "@/hooks/use-joined-events";
import { authClient } from "@/lib/auth-client";
import { leaveEvent } from "@/lib/joined-events";
import { toast } from "sonner";

import { apiUrl } from "@/lib/api";
import { getTokenFromClient } from "@/lib/getTokenFromClient";



/** Events API of the social-bridge backend (see social-bridge-server/index.js). */
const EVENTS_API_URL = apiUrl("/create-event");

/** Number of placeholder cards shown while the events are loading. */
const SKELETON_CARD_COUNT = 3;

/** A donation event document as stored in MongoDB by the backend. */
interface DonationEvent {
  _id: string;
  title: string;
  
  type?: string;
  
  date: string;
  location?: string;


  thumbnail?: string;
  description?: string;
}

type LoadStatus = "loading" | "success" | "error";

/**
 * Parses an event date into a local Date. "YYYY-MM-DD" values are built
 * manually so timezone offsets cannot shift them to the previous day.
 */
function parseEventDate(value: string): Date | null {
  const trimmed = value.trim();
  const isoDay = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  const parsed = isoDay
    ? new Date(Number(isoDay[1]), Number(isoDay[2]) - 1, Number(isoDay[3]))
    : new Date(trimmed);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Minimal shape check so a malformed document never breaks the whole list. */
function isDonationEvent(value: unknown): value is DonationEvent {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate._id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.date === "string"
  );
}

/** Sorts by date without mutating the original array. */
function sortByDate(events: DonationEvent[]): DonationEvent[] {
  return [...events].sort((first, second) => {
    const firstTime = parseEventDate(first.date)?.getTime() ?? 0;
    const secondTime = parseEventDate(second.date)?.getTime() ?? 0;

    return firstTime - secondTime;
  });
}

/** Splits joined events into upcoming (today or later) and already-happened. */
function splitByDate(events: DonationEvent[], now: Date): {
  upcoming: DonationEvent[];
  past: DonationEvent[];
} {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const upcoming: DonationEvent[] = [];
  const past: DonationEvent[] = [];

  for (const event of events) {
    const eventDate = parseEventDate(event.date);

    if (eventDate !== null && eventDate >= startOfToday) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  }

  return { upcoming: sortByDate(upcoming), past: sortByDate(past).reverse() };
}

/** A single joined event card with a leave action. */
function JoinedEventCard({
  event,
  isPast,
  onLeave,
}: {
  event: DonationEvent;
  isPast: boolean;
  onLeave: (event: DonationEvent) => void;
}) {
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

        {isPast && (
          <span className="absolute top-4 right-4 rounded-full bg-slate-900/75 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            Completed
          </span>
        )}
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

        <div className="mt-6 flex flex-col gap-3">
          {/* Details live on the dynamic /upcoming-events/[id] route */}
          <Link
            href={`/upcoming-events/${event._id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-800 py-2.5 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-800 hover:text-white"
          >
            View Details
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>

          <Button
            type="button"
            variant="outline"
            onClick={() => onLeave(event)}
            className="rounded-xl border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            Leave Event
          </Button>
        </div>
      </div>
    </article>
  );
}

/** Placeholder card matching the event card layout, shown while loading. */
function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <Skeleton className="h-52 w-full rounded-none" />

      <div className="space-y-3 p-6">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="mt-4 h-10 w-full" />
      </div>
    </div>
  );
}

export default function JoinedEventsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  const { joinedIds, isHydrated } = useJoinedEvents();

  const [status, setStatus] = useState<LoadStatus>("loading");
  const [allEvents, setAllEvents] = useState<DonationEvent[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bumped by the "Try again" button to refetch after a failure.
  const [reloadKey, setReloadKey] = useState(0);

  // "Now" for the upcoming/past split, captured together with the fetch:
  // `new Date()` must not run during the prerender, and setting it inside the
  // async fetch callback keeps it out of the effect body.
  const [now, setNow] = useState<Date | null>(null);

  const retry = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    // Wait for localStorage to hydrate so we don't flash the empty state.
    if (!isHydrated || !user) return;

    const controller = new AbortController();

    async function fetchEvents() {
      setStatus("loading");

      try {
        // The backend requires a session JWT on every events route.
        const token = await getTokenFromClient();

        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(EVENTS_API_URL, {
          signal: controller.signal,
          headers,
        });

        if (!response.ok) {
          throw new Error(`The server responded with status ${response.status}.`);
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("The server returned an unexpected response.");
        }

        setAllEvents(data.filter(isDonationEvent));
        setNow(new Date());
        setErrorMessage(null);
        setStatus("success");
      } catch (error) {
        // Ignore aborted requests (e.g. React StrictMode remounts).
        if (controller.signal.aborted) return;

        console.error("Error fetching joined events:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong while fetching your events."
        );
        setStatus("error");
      }
    }

    void fetchEvents();

    return () => controller.abort();
  }, [isHydrated, user, reloadKey]);


  const { upcoming } = useMemo(() => {
    const joined = allEvents.filter((event) => joinedIds.has(event._id));

    return now ? splitByDate(joined, now) : { upcoming: [], past: [] };
  }, [allEvents, joinedIds, now]);

  if (isPending) {
    return (
      <section className="py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48" />
        </div>
      </section>
    );
  }
  if (!user) return null;

  function handleLeave(event: DonationEvent) {
    leaveEvent(event._id);

    toast.info(`You left ${event.title}`, {
      description: "You can join again from the event page anytime.",
    });
  }

  return (
    <section
      aria-labelledby="joined-events-heading"
      className="relative overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-32 size-80 rounded-full bg-green-100/60 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-20 size-72 rounded-full bg-amber-100/70 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/upcoming-events"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:text-green-900"
        >
          <ArrowLeft className="size-4" />
          Back to Upcoming Events
        </Link>

        <SectionHeading
          headingId="joined-events-heading"
          eyebrow="My Commitments"
          title="Events You've Joined"
          description="Every drive you've signed up for, in one place. Manage your commitments or head back to find another cause."
        />

        <div className="mt-12" aria-busy={status === "loading"}>
          {status === "loading" && (
            <>
              <p className="sr-only" role="status">
                Loading your joined events…
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
                We couldn&apos;t load your events
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
            (upcoming.length === 0 ? (
              <Empty className="min-h-72 rounded-3xl border bg-white shadow-sm">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HeartHandshake />
                  </EmptyMedia>

                  <EmptyTitle>You haven&apos;t joined any upcoming events</EmptyTitle>

                  <EmptyDescription>
                    When you sign up for an upcoming drive, it will show up here
                    so you never lose track of your commitments.
                  </EmptyDescription>
                </EmptyHeader>

                <Button
                  render={<Link href="/upcoming-events" />}
                  className="mt-2 rounded-full px-6"
                >
                  Browse Upcoming Events
                </Button>
              </Empty>
            ) : (
              <div className="space-y-12">
                {upcoming.length > 0 && (
                  <section aria-labelledby="joined-upcoming-heading">
                    <h2
                      id="joined-upcoming-heading"
                      className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase"
                    >
                      <CalendarDays className="size-4 text-brand-800" aria-hidden="true" />
                      Upcoming ({upcoming.length})
                    </h2>

                    <ul className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                      {upcoming.map((event) => (
                        <li key={event._id} className="h-full">
                          <JoinedEventCard
                            event={event}
                            isPast={false}
                            onLeave={handleLeave}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
