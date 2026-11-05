import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { io } from "next/cache";
import { format } from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  Droplet,
  Heart,
  Mail,
  MapPin,
  ShieldCheck,
  Shirt,
  Sparkles,
  Stethoscope,
  Trees,
  UtensilsCrossed,
  Users,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import EventJoinBar from "./event-join-bar";
import { apiUrl } from "@/lib/api";
import { getTokenServer } from "@/lib/getTokenServer";



/** Events API of the social-bridge backend (see social-bridge-server/index.js). */
const EVENT_API_URL = apiUrl("/upcoming-event");

/** MongoDB ObjectId — used to short-circuit obvious 404s before hitting the API. */
const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/i;

/** A donation event document as stored in MongoDB by the backend. */
interface UpcomingEvent {
  _id: string;
  title: string;
  /** Event type, e.g. "Food Distribution" or "Blood Donation". */
  type?: string;
  /** Event day, stored by the create-event form as "YYYY-MM-DD". */
  date: string;
  location?: string;
  /** HTTPS URL of the event cover image. */
  thumbnail?: string;
  description?: string;
  /** Organizer email attached by the create-event form. */
  email?: string;
  /** Organizer display name, when the backend provides one. */
  organizerName?: string;
  /** Number of volunteers already signed up. */
  volunteers?: number;
  /** Optional per-event volunteer guidelines. */
  guidelines?: string[];
}

/** Badge icon for each event type offered on the create-event form. */
const TYPE_ICONS: Record<string, LucideIcon> = {
  Donation: Heart,
  "Food Distribution": UtensilsCrossed,
  "Clothing Drive": Shirt,
  "Clothing Donation": Shirt,
  "Blood Donation": Droplet,
  "Environmental Cleanup": Trees,
  "Medical Support": Stethoscope,
  "Education Support": BookOpen,
  "Community Service": Users,
};

/** Shown when the event does not ship its own volunteer guidelines. */
const DEFAULT_GUIDELINES = [
  "Please arrive 15 minutes before the scheduled time at the designated location.",
  "Wear comfortable clothing suitable for physical social work and distribution.",
  "Bring any pre-coordinated relief packages or distribution items if requested.",
];

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

/** Minimal shape check so a malformed document never breaks the page. */
function isUpcomingEvent(value: unknown): value is UpcomingEvent {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate._id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.date === "string"
  );
}

/** "rakib.hasan@socialbridge.org" → "Rakib Hasan". */
function organizerNameFromEmail(email: string): string {
  const [localPart = ""] = email.split("@");
  const words = localPart.split(/[._\-+]+/).filter(Boolean);

  if (words.length === 0) return "Event Organizer";

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** First two initials of a name, used for the organizer avatar. */
function initialsFrom(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

async function fetchEvent(id: string): Promise<UpcomingEvent | null> {
  if (!OBJECT_ID_PATTERN.test(id)) return null;

  // getTokenServer() is async — without the await the header would become
  // "Bearer [object Promise]" and every detail request would be rejected.
  const token = await getTokenServer();

  const headers = new Headers();
  if (token) headers.set("authorization", `Bearer ${token}`);

  const response = await fetch(`${EVENT_API_URL}/${id}`, { headers });

  if (!response.ok) return null;

  const data: unknown = await response.json().catch(() => null);
  const event =
    data && typeof data === "object" && "result" in data
      ? (data as { result: unknown }).result
      : data;

  return isUpcomingEvent(event) ? event : null;
}

async function EventDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Keep this out of the static shell. The build prerenders the route with
  // placeholder params, which fail the ObjectId check below before any real
  // I/O runs — without a suspension point, notFound() would be baked into
  // the prerender and every visitor would see "Event not found". io()
  // suspends during prerendering (the skeleton ships in the shell) and
  // resolves immediately on real requests, so the fetch always runs with
  // the actual event id.
  await io();

  const { id } = await params;
  const event = await fetchEvent(id);

  if (!event) notFound();

  const eventDate = parseEventDate(event.date);
  const TypeIcon = (event.type && TYPE_ICONS[event.type]) || Sparkles;
  const hasThumbnail = Boolean(event.thumbnail);

  const organizerName =
    event.organizerName?.trim() ||
    (event.email ? organizerNameFromEmail(event.email) : "Event Organizer");

  const guidelines =
    Array.isArray(event.guidelines) && event.guidelines.length > 0
      ? event.guidelines
      : DEFAULT_GUIDELINES;

  const location = event.location?.trim() || "Location to be announced";
  const description =
    event.description?.trim() ||
    "More details about this event will be shared soon.";

  return (
    <article>
      {/* Cover hero */}
      <header className="relative h-72 w-full overflow-hidden sm:h-96 lg:h-[440px]">
        {hasThumbnail ? (
          <Image
            src={event.thumbnail as string}
            alt={`${event.title} cover image`}
            fill
            priority
            unoptimized
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-brand-50"
          >
            <CalendarDays className="size-14 text-brand-800/40" />
          </div>
        )}

        {/* Legibility gradient over the cover image */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/55 to-navy/25"
        />

        <div className="absolute inset-0">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col justify-between px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-navy shadow-sm">
              <TypeIcon className="size-4 text-brand-700" aria-hidden="true" />
              {event.type || "Community Event"}
            </span>

            <div className="max-w-3xl">
              <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {event.title}
              </h1>

              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
                <li className="flex items-center gap-2">
                  <MapPin
                    className="size-4 shrink-0 text-brand-200"
                    aria-hidden="true"
                  />
                  {location}
                </li>

                <li className="flex items-center gap-2">
                  <CalendarDays
                    className="size-4 shrink-0 text-brand-200"
                    aria-hidden="true"
                  />
                  {eventDate ? format(eventDate, "EEE, MMM d, yyyy") : "Date to be announced"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      {/* Details panel */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <EventJoinBar
            id={event._id}
            title={event.title}
            volunteers={event.volunteers ?? 0}
          />

          <div className="mt-10 grid gap-10 lg:grid-cols-3">
            {/* About + guidelines */}
            <div className="lg:col-span-2">
              <h2 className="font-heading text-2xl font-bold text-navy">
                About this Social Initiative
              </h2>

              <p className="mt-4 leading-relaxed text-muted-foreground">
                {description}
              </p>

              <hr className="my-8 border-border" />

              <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Volunteer Guidelines
              </h3>

              <ul className="mt-5 space-y-4">
                {guidelines.map((guideline) => (
                  <li
                    key={guideline}
                    className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-600"
                    />
                    {guideline}
                  </li>
                ))}
              </ul>
            </div>

            {/* Organizer */}
            <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Initiative Organizer
              </p>

              <div className="mt-4 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-100 font-heading font-bold text-brand-800"
                >
                  {initialsFrom(organizerName)}
                </span>

                <div className="min-w-0">
                  <p className="truncate font-heading font-semibold text-navy">
                    {organizerName}
                  </p>

                  {event.email && (
                    <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                      <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                      {event.email}
                    </p>
                  )}
                </div>
              </div>

              <hr className="my-5 border-border" />

              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="size-4 text-brand-700" aria-hidden="true" />
                Verified Platform Member
              </p>
            </aside>
          </div>
        </div>
      </section>
    </article>
  );
}

/** Placeholder shown while the event is being fetched. */
function EventDetailsSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="h-72 w-full rounded-none sm:h-96 lg:h-[440px]" />

      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex items-center justify-between gap-4 rounded-3xl border border-border p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-2xl" />

              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>

            <Skeleton className="h-12 w-36 rounded-xl" />
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Skeleton className="h-7 w-72" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="my-4 h-px w-full" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-10/12" />
            </div>

            <div className="space-y-4 rounded-3xl p-6 ring-1 ring-black/5">
              <Skeleton className="h-4 w-44" />
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-44" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<EventDetailsSkeleton />}>
      <EventDetails params={params} />
    </Suspense>
  );
}
