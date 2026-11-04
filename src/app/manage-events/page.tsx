"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CalendarOff,
  CirclePlus,
  LoaderCircle,
  Lock,
  MapPin,
  Pencil,
  RotateCcw,
  Settings,
  Sprout,
  Trash2,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import EditEventDialog from "@/components/EditEventDialog";
import { currentUser } from "@/data/create-event";
import { useOrganizerEmail } from "@/hooks/use-organizer-email";
import { apiUrl } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { getTokenFromClient } from "@/lib/getTokenFromClient";
import type { DonationEvent } from "@/types";

/**
 * Manage Events page.
 *
 * Lists the events created by the signed-in organizer so they can update or
 * delete them. Ownership is decided by the organizer email attached at
 * creation time — the backend re-checks it on every write, so a tampered
 * client cannot touch someone else's event.
 */

/** Events API of the social-bridge backend (see social-bridge-server/index.js). */
const EVENTS_API_URL = apiUrl("/create-event");

/** Delete endpoint; the organizer email travels as a query param. */
const EVENT_MUTATION_URL = apiUrl("/events");

/** Number of placeholder cards shown while the events are loading. */
const SKELETON_CARD_COUNT = 3;

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

    return secondTime - firstTime;
  });
}

/** True when the event day is today or later. */
function isUpcoming(event: DonationEvent): boolean {
  const eventDate = parseEventDate(event.date);

  if (eventDate === null) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return eventDate >= startOfToday;
}

/** A single manageable event card with view, edit and delete actions. */
function ManageEventCard({
  event,
  isDeleting,
  onEdit,
  onDelete,
}: {
  event: DonationEvent;
  isDeleting: boolean;
  onEdit: (event: DonationEvent) => void;
  onDelete: (event: DonationEvent) => void;
}) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  const eventDate = parseEventDate(event.date);
  const hasThumbnail = Boolean(event.thumbnail) && !thumbnailFailed;
  const upcoming = isUpcoming(event);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-20px_rgba(15,23,42,0.3)]">
      {/* Event thumbnail */}
      <div className="relative h-56 overflow-hidden bg-muted">
        {hasThumbnail ? (
          <>
            <img
              src={event.thumbnail}
              alt={`${event.title} thumbnail`}
              loading="lazy"
              onError={() => setThumbnailFailed(true)}
              className="size-full object-cover transition duration-500 group-hover:scale-105"
            />

            {/* Keeps the date chip readable over busy photos */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/75 via-slate-900/30 to-transparent"
            />
          </>
        ) : (
          <div
            aria-hidden="true"
            className="flex size-full items-center justify-center bg-brand-50"
          >
            <CalendarDays className="size-9 text-brand-800/30" />
          </div>
        )}

        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand-800 shadow-sm backdrop-blur">
          <Sprout className="size-3.5" aria-hidden="true" />
          {event.type || "Community Event"}
        </span>

        {!upcoming && (
          <span className="absolute top-4 right-4 rounded-full bg-slate-900/75 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur">
            Completed
          </span>
        )}

        <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur">
          <CalendarDays className="size-3.5 text-brand-200" aria-hidden="true" />
          {eventDate ? format(eventDate, "EEE, MMM d, yyyy") : "Date to be announced"}
        </span>
      </div>

      {/* Event information */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-heading text-xl font-bold leading-snug text-brand-800 transition-colors group-hover:text-brand-900">
          {event.title}
        </h3>

        <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="size-4 shrink-0 text-brand-700" aria-hidden="true" />
          <span className="min-w-0 truncate">
            {event.location || "Location to be announced"}
          </span>
        </p>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {event.description || "More details about this event will be shared soon."}
        </p>

        {/* Pushes the footer to the bottom so every card lines up */}
        <div className="flex-1" aria-hidden="true" />

        {/* Organizer */}
        <p className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
          <User className="size-4 shrink-0 text-brand-700" aria-hidden="true" />
          <span className="min-w-0 truncate">
            {event.email || "Organized by you"}
          </span>
        </p>

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          <Button
            render={<Link href={`/upcoming-events/${event._id}`} />}
            className="h-10 flex-[1.5] gap-2 rounded-xl bg-muted font-semibold text-foreground hover:bg-slate-200"
          >
            View
          </Button>

          <Button
            type="button"
            onClick={() => onEdit(event)}
            disabled={isDeleting}
            className="h-10 flex-1 gap-2 rounded-xl bg-indigo-50 font-semibold text-indigo-600 hover:bg-indigo-100"
          >
            <Pencil className="size-4" />
            Edit
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onDelete(event)}
            disabled={isDeleting}
            className="h-10 flex-1 gap-2 rounded-xl border-red-100 bg-red-50 font-semibold text-red-600 hover:border-red-200 hover:bg-red-100 hover:text-red-700"
          >
            {isDeleting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </article>
  );
}

/** Placeholder card matching the event card layout, shown while loading. */
function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5">
      <Skeleton className="h-56 w-full rounded-none" />

      <div className="space-y-3 p-6">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />

        <div className="flex gap-2 pt-2">
          <Skeleton className="h-10 flex-[1.5] rounded-xl" />
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function ManageEventsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  // The organizer identity is the email typed on the Create Event form,
  // remembered in localStorage. Falls back to the signed-in user's email.
  const { email: organizerEmail, isHydrated } = useOrganizerEmail(
    user?.email ?? currentUser?.email ?? null
  );

  // Without an organizer identity there is nothing the user may manage, so
  // the list starts empty instead of waiting on a fetch that never happens.
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [events, setEvents] = useState<DonationEvent[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bumped by the "Try again" button to refetch after a failure.
  const [reloadKey, setReloadKey] = useState(0);

  const [editingEvent, setEditingEvent] = useState<DonationEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<DonationEvent | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const retry = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    // Wait for localStorage so we never fetch as the wrong organizer, and
    // skip entirely when there is no identity to manage.
    if (!isHydrated || !organizerEmail) return;

    const controller = new AbortController();

    async function fetchEvents() {
      setStatus("loading");

      try {
      
const token = await getTokenFromClient();

if (!token) {
  throw new Error("Authentication token not found. Please sign in again.");
}

const response = await fetch(EVENTS_API_URL, {
  signal: controller.signal,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

if (!response.ok) {
  throw new Error(`The server responded with status ${response.status}.`);
}

const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("The server returned an unexpected response.");
        }

        // Ownership filter: only events this organizer created.
        const mine = data
          .filter(isDonationEvent)
          .filter((event) => event.email === organizerEmail);

        setEvents(sortByDate(mine));
        setErrorMessage(null);
        setStatus("success");
      } catch (error) {
        // Ignore aborted requests (e.g. React StrictMode remounts).
        if (controller.signal.aborted) return;

        console.error("Error fetching your events:", error);

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
  }, [isHydrated, organizerEmail, reloadKey]);

  // Keeps the grid in sync after a successful edit without a refetch.
  function handleSaved(updated: DonationEvent) {
    setEvents((previous) =>
      sortByDate(previous.map((item) => (item._id === updated._id ? updated : item)))
    );
  }

  async function confirmDelete() {
    const target = deletingEvent;

    if (!target || !organizerEmail || deletingId) return;

    setDeletingId(target._id);

    const toastId = toast.loading("Deleting the event...");

    try {
      const query = new URLSearchParams({ email: organizerEmail });

      // Same session JWT as the edit dialog: lets the backend verify the
      // caller instead of only seeing a self-declared email. Omitted when no
      // token is available, so the current backend keeps working unchanged.
      const token = await getTokenFromClient();

      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(
        `${EVENT_MUTATION_URL}/${target._id}?${query.toString()}`,
        { method: "DELETE", headers }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete the event.");
      }

      setEvents((previous) =>
        previous.filter((item) => item._id !== target._id)
      );

      toast.success("Event deleted", {
        id: toastId,
        description: `"${target.title}" has been removed.`,
      });
    } catch (error) {
      console.error("Error deleting event:", error);

      toast.error("Failed to delete the event", {
        id: toastId,
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setDeletingId(null);
      setDeletingEvent(null);
    }
  }

  const upcomingCount = useMemo(
    () => events.filter(isUpcoming).length,
    [events]
  );


  const viewStatus: LoadStatus = !isHydrated
    ? "loading"
    : organizerEmail
      ? status
      : "success";

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

  return (
    <section
      aria-labelledby="manage-events-heading"
      className="relative overflow-hidden py-14 sm:py-16 lg:py-20"
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
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-800 transition-colors hover:text-brand-900"
        >
          <ArrowLeft className="size-4" />
          Back to Upcoming Events
        </Link>

        {/* Page header: title on the left, primary action on the right */}
        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-violet-700">
              <Settings className="size-3.5" aria-hidden="true" />
              Organizer Dashboard
            </span>

            <h1
              id="manage-events-heading"
              className="mt-5 text-4xl font-extrabold tracking-tight text-navy sm:text-5xl"
            >
              Manage My Events
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              View, edit, and manage the social drives you have published.
              Only you have permission to edit or delete your created
              initiatives.
            </p>
          </div>

          <Button
            render={<Link href="/create-event" />}
            className="h-12 w-full shrink-0 gap-2 rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 sm:w-auto"
          >
            <CirclePlus className="size-4" />
            Create New Event
          </Button>
        </header>

        <div className="mt-8 border-t border-border" />

        {/* Signed-in organizer summary */}
        {organizerEmail && viewStatus === "success" && events.length > 0 && (
          <div className="mt-6 inline-flex max-w-full items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-4 py-2.5 text-sm text-brand-900">
            <Lock className="size-4 shrink-0 text-brand-700" aria-hidden="true" />

            <p className="min-w-0">
              Showing events organized by{" "}
              <span className="font-semibold break-all">{organizerEmail}</span>{" "}
              — {events.length} total, {upcomingCount} upcoming.
            </p>
          </div>
        )}

        <div className="mt-10" aria-busy={viewStatus === "loading"}>
          {viewStatus === "loading" && (
            <>
              <p className="sr-only" role="status">
                Loading your events…
              </p>

              <ul
                aria-hidden="true"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
                  <li key={index} className="h-full">
                    <EventCardSkeleton />
                  </li>
                ))}
              </ul>
            </>
          )}

          {viewStatus === "error" && (
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

          {viewStatus === "success" &&
            (events.length === 0 ? (
              <Empty className="min-h-72 rounded-3xl border bg-white shadow-sm">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CalendarOff />
                  </EmptyMedia>

                  <EmptyTitle>
                    {organizerEmail
                      ? "You haven't created any events yet"
                      : "No organizer account found"}
                  </EmptyTitle>

                  <EmptyDescription>
                    {organizerEmail
                      ? "Create your first community event and it will show up here so you can edit or delete it later."
                      : "Sign in as an organizer to see and manage the events you've created."}
                  </EmptyDescription>
                </EmptyHeader>

                {organizerEmail && (
                  <Button
                    render={<Link href="/create-event" />}
                    className="mt-2 rounded-full px-6"
                  >
                    Create an Event
                  </Button>
                )}
              </Empty>
            ) : (
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <li key={event._id} className="h-full">
                    <ManageEventCard
                      event={event}
                      isDeleting={deletingId === event._id}
                      onEdit={setEditingEvent}
                      onDelete={setDeletingEvent}
                    />
                  </li>
                ))}
              </ul>
            ))}
        </div>
      </div>

      {/* Edit dialog */}
      <EditEventDialog
        event={editingEvent}
        open={editingEvent !== null}
        onOpenChange={(open) => {
          if (!open) setEditingEvent(null);
        }}
        onSaved={handleSaved}
        organizerEmail={organizerEmail}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={deletingEvent !== null}
        onOpenChange={(open) => {
          if (!open && !deletingId) setDeletingEvent(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-semibold text-foreground">
                {deletingEvent?.title}
              </span>{" "}
              and all of its details. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deletingId !== null}
              className="bg-red-600 font-semibold text-white hover:bg-red-700"
            >
              {deletingId !== null && (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              )}
              {deletingId !== null ? "Deleting..." : "Yes, Delete Event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
