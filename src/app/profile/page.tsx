"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  HeartHandshake,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { authClient } from "@/lib/auth-client";
import { useJoinedEvents } from "@/hooks/use-joined-events";
import { useOrganizerEmail } from "@/hooks/use-organizer-email";
import { apiUrl } from "@/lib/api";
import type { DonationEvent } from "@/types";

/** Events API of the social-bridge backend. */
const EVENTS_API_URL = apiUrl("/create-event");

type LoadStatus = "loading" | "success" | "error";

interface DonationEventDoc extends DonationEvent {
  email?: string;
}

function parseEventDate(value: string): Date | null {
  const trimmed = value.trim();
  const isoDay = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  const parsed = isoDay
    ? new Date(Number(isoDay[1]), Number(isoDay[2]) - 1, Number(isoDay[3]))
    : new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isDonationEvent(value: unknown): value is DonationEventDoc {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate._id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.date === "string"
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <span className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-800">
        <Icon className="size-5" aria-hidden={true} />
      </span>
      <div>
        <p className="text-2xl font-bold text-navy">{value}</p>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  // Guard: only logged-in users may view this page.
  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  const { joinedIds, isHydrated: joinedHydrated } = useJoinedEvents();
  const { email: organizerEmail, isHydrated: organizerHydrated } =
    useOrganizerEmail(user?.email ?? null);

  const [status, setStatus] = useState<LoadStatus>("loading");
  const [events, setEvents] = useState<DonationEventDoc[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [now, setNow] = useState<Date | null>(null);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    async function fetchEvents() {
      setStatus("loading");
      try {
        const response = await fetch(EVENTS_API_URL, { signal: controller.signal });
        if (!response.ok) throw new Error(`Server responded with ${response.status}.`);
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("Unexpected response.");
        setEvents(data.filter(isDonationEvent));
        setNow(new Date());
        setErrorMessage(null);
        setStatus("success");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Error fetching profile events:", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Something went wrong."
        );
        setStatus("error");
      }
    }
    void fetchEvents();
    return () => controller.abort();
  }, [user, reloadKey]);

  const joinedEvents = useMemo(
    () => events.filter((event) => joinedIds.has(event._id)),
    [events, joinedIds]
  );

  const organizedEvents = useMemo(() => {
    if (!organizerEmail) return [];
    return events.filter(
      (event) => (event.email ?? "").toLowerCase() === organizerEmail.toLowerCase()
    );
  }, [events, organizerEmail]);

  const upcomingJoined = useMemo(() => {
    if (!now) return [];
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return joinedEvents.filter((event) => {
      const d = parseEventDate(event.date);
      return d !== null && d >= start;
    });
  }, [joinedEvents, now]);

  async function handleSignOut() {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error("Could not sign out", { description: error.message });
      return;
    }
    toast.success("Signed out", { description: "See you again soon!" });
    router.push("/");
    router.refresh();
  }

  if (isPending) {
    return (
      <section className="py-16 sm:py-20">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    // Redirecting; render nothing to avoid flash.
    return null;
  }

  const firstName = user.name?.split(" ")[0] ?? user.email ?? "there";
  const initial = firstName.charAt(0).toUpperCase();
  const memberSince = (user as { createdAt?: string | Date }).createdAt
    ? format(
        new Date((user as { createdAt: string | Date }).createdAt),
        "MMM yyyy"
      )
    : null;

  return (
    <section
      aria-labelledby="profile-heading"
      className="relative overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-32 size-80 rounded-full bg-green-100/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-20 size-72 rounded-full bg-amber-100/70 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Profile header */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5">
          <div className="h-32 bg-gradient-to-r from-brand-800 to-brand-600" />
          <div className="px-6 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <Avatar className="size-24 ring-4 ring-white">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name ?? ""} />
                  ) : null}
                  <AvatarFallback className="bg-brand-800 text-2xl font-bold text-white">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="pb-1">
                  <h1
                    id="profile-heading"
                    className="font-heading text-2xl font-bold text-navy sm:text-3xl"
                  >
                    {user.name ?? firstName}
                  </h1>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="size-4" aria-hidden={true} />
                    {user.email}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full bg-brand-50 text-brand-800">
                      <ShieldCheck className="mr-1 size-3.5" aria-hidden={true} />
                      Verified member
                    </Badge>
                    {memberSince && (
                      <span className="text-xs text-muted-foreground">
                        Member since {memberSince}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="rounded-full border-brand-800/30 text-brand-800 hover:border-brand-800 hover:bg-brand-50"
                  onClick={() => toast.info("Profile editing coming soon")}
                >
                  <UserIcon className="mr-2 size-4" />
                  Edit profile
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="rounded-full border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
                >
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Events joined"
            value={joinedHydrated ? joinedEvents.length : "—"}
            icon={HeartHandshake}
          />
          <StatCard
            label="Upcoming"
            value={joinedHydrated ? upcomingJoined.length : "—"}
            icon={CalendarDays}
          />
          <StatCard
            label="Events organized"
            value={organizerHydrated ? organizedEvents.length : "—"}
            icon={Sparkles}
          />
          <StatCard
            label="Available drives"
            value={status === "success" ? events.length : "—"}
            icon={HeartHandshake}
          />
        </div>

        {/* Joined events */}
        <div className="mt-12">
          <SectionHeading
            headingId="joined-heading"
            eyebrow="My Commitments"
            title="Events You've Joined"
            description="Drives you've signed up for, newest first."
          />
          <div className="mt-6" aria-busy={status === "loading"}>
            {status === "loading" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                ))}
              </div>
            )}
            {status === "error" && (
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
                <Button onClick={retry} variant="outline" className="rounded-full">
                  Try again
                </Button>
              </div>
            )}
            {status === "success" &&
              (joinedEvents.length === 0 ? (
                <Empty className="min-h-48 rounded-2xl border bg-white shadow-sm">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <HeartHandshake />
                    </EmptyMedia>
                    <EmptyTitle>No joined events yet</EmptyTitle>
                    <EmptyDescription>
                      Browse upcoming drives and sign up to see them here.
                    </EmptyDescription>
                  </EmptyHeader>
                  <Button render={<Link href="/upcoming-events" />} className="mt-2 rounded-full px-6">
                    Browse events
                  </Button>
                </Empty>
              ) : (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {joinedEvents.slice(0, 6).map((event) => {
                    const d = parseEventDate(event.date);
                    return (
                      <li key={event._id}>
                        <Link
                          href={`/upcoming-events/${event._id}`}
                          className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800">
                            <CalendarDays className="size-5" aria-hidden={true} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-navy">
                              {event.title}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {event.location || "Location TBA"} ·{" "}
                              {d ? format(d, "MMM dd, yyyy") : "Date TBA"}
                            </p>
                          </div>
                          <ArrowRight className="size-4 text-muted-foreground" aria-hidden={true} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ))}
          </div>
        </div>

        {/* Organized events */}
        {organizerHydrated && organizedEvents.length > 0 && (
          <div className="mt-12">
            <SectionHeading
              headingId="organized-heading"
              eyebrow="Organizer"
              title="Events You've Organized"
              description="Drives created under your account."
            />
            <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {organizedEvents.slice(0, 6).map((event) => {
                const d = parseEventDate(event.date);
                return (
                  <li key={event._id}>
                    <Link
                      href={`/upcoming-events/${event._id}`}
                      className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                        <Sparkles className="size-5" aria-hidden={true} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-navy">{event.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {event.type || "Community Event"} ·{" "}
                          {d ? format(d, "MMM dd, yyyy") : "Date TBA"}
                        </p>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground" aria-hidden={true} />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4">
              <Link
                href="/manage-events"
                className="text-sm font-semibold text-brand-800 hover:underline"
              >
                Manage all your events →
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}