/**
 * Shared event data source.
 *
 * The homepage's FeaturedEvents section and the Upcoming Events page both
 * load donation events through this module, so every event created from the
 * create-event form shows up in both places with the same filtering and
 * ordering rules.
 */

import { apiUrl } from "@/lib/api";
import { getTokenFromClient } from "@/lib/getTokenFromClient";

/** Events API of the social-bridge backend (see social-bridge-server/index.js). */
export const EVENTS_API_URL = apiUrl("/create-event");

/** A donation event document as stored in MongoDB by the backend. */
export interface DonationEvent {
  _id: string;
  title: string;
  /** Event type, e.g. "Food Distribution" or "Blood Donation". */
  type?: string;
  /** Event day, stored by the create-event form as "YYYY-MM-DD". */
  date: string;
  location?: string;
  /** HTTPS URL of the event thumbnail. */
  thumbnail?: string;
  description?: string;
}

/** Lifecycle of a request for the event list. */
export type LoadStatus = "loading" | "success" | "error";

/**
 * Parses an event date into a local Date. "YYYY-MM-DD" values are built
 * manually so timezone offsets cannot shift them to the previous day.
 */
export function parseEventDate(value: string): Date | null {
  const trimmed = value.trim();
  const isoDay = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  const parsed = isoDay
    ? new Date(Number(isoDay[1]), Number(isoDay[2]) - 1, Number(isoDay[3]))
    : new Date(trimmed);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Minimal shape check so a malformed document never breaks the whole list. */
export function isDonationEvent(value: unknown): value is DonationEvent {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate._id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.date === "string"
  );
}

/** Keeps events happening today or later, sorted nearest date first. */
function toUpcomingEvents(documents: DonationEvent[]): DonationEvent[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return documents.filter((event) => {
    const eventDate = parseEventDate(event.date);

    return eventDate !== null && eventDate >= startOfToday;
  });
}

/** Sorts by date without mutating the original array. */
function sortByDate(events: DonationEvent[]): DonationEvent[] {
  return [...events].sort((first, second) => {
    const firstTime = parseEventDate(first.date)?.getTime() ?? 0;
    const secondTime = parseEventDate(second.date)?.getTime() ?? 0;

    return firstTime - secondTime;
  });
}

/**
 * Loads every event dated today or later from the backend, nearest first.
 *
 * Throws when the backend is unreachable or answers with an unexpected
 * shape so callers can surface their own error state.
 */
export async function fetchUpcomingEvents(
  signal?: AbortSignal
): Promise<DonationEvent[]> {
  // The backend guards GET /create-event with verifyToken, so the session
  // JWT travels along. Omitted when signed out (the request then fails with
  // 401 and the caller surfaces its error state).
  const token = await getTokenFromClient();

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(EVENTS_API_URL, { signal, headers });

  if (!response.ok) {
    throw new Error(`The server responded with status ${response.status}.`);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("The server returned an unexpected response.");
  }

  return sortByDate(toUpcomingEvents(data.filter(isDonationEvent)));
}
