/**
 * Local persistence for volunteer sign-ups.
 *
 * The backend does not expose a join-event endpoint yet, so sign-ups live in
 * localStorage. A window event keeps every mounted copy of the store (the
 * join bar, the joined-events page, and other open tabs) in sync.
 */

/** A single volunteer sign-up as stored in localStorage. */
export interface JoinedEvent {
  /** MongoDB _id of the event, as used by the /upcoming-events/[id] route. */
  id: string;
  title: string;
  /** ISO timestamp of when the volunteer signed up. */
  joinedAt: string;
}

const STORAGE_KEY = "socialbridge.joined-events";
const CHANGE_EVENT = "socialbridge:joined-events-change";

/** Minimal shape check so a corrupt entry never breaks the whole list. */
function isJoinedEvent(value: unknown): value is JoinedEvent {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" && typeof candidate.title === "string"
  );
}

/** Reads the stored sign-ups, tolerating corrupt or outdated data. */
export function readJoinedEvents(): JoinedEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed.filter(isJoinedEvent) : [];
  } catch {
    return [];
  }
}

function writeJoinedEvents(events: JoinedEvent[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // Storage may be full or blocked — sign-ups simply won't persist.
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Whether the given event id has a stored sign-up. */
export function isEventJoined(id: string): boolean {
  return readJoinedEvents().some((event) => event.id === id);
}

/** Stores a sign-up. Existing sign-ups for the same event are kept as-is. */
export function joinEvent(event: JoinedEvent): void {
  const current = readJoinedEvents();

  if (current.some((item) => item.id === event.id)) return;

  writeJoinedEvents([...current, event]);
}

/** Removes the sign-up for the given event id, if present. */
export function leaveEvent(id: string): void {
  writeJoinedEvents(readJoinedEvents().filter((event) => event.id !== id));
}

/** Flips the sign-up state. @returns true when the event is now joined. */
export function toggleEventJoin(event: JoinedEvent): boolean {
  if (isEventJoined(event.id)) {
    leaveEvent(event.id);
    return false;
  }

  joinEvent(event);
  return true;
}

/** Subscribes to local sign-up changes, including ones from other tabs. */
export function subscribeToJoinedEvents(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(CHANGE_EVENT, listener);

  return () => window.removeEventListener(CHANGE_EVENT, listener);
}
