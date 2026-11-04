/**
 * Local persistence for the active organizer email.
 *
 * There is no auth backend yet, so the organizer identity is whichever email
 * was last typed into the Create Event form. Manage Events and the Edit
 * dialog read this same value, which is what keeps the client-side ownership
 * filter pointing at the same person the backend re-checks on PUT/DELETE.
 *
 * The pattern mirrors src/lib/joined-events.ts: a window event keeps every
 * mounted copy (and other tabs) in sync.
 */

const STORAGE_KEY = "socialbridge.organizer-email";
const CHANGE_EVENT = "socialbridge:organizer-change";

/**
 * Reads the remembered organizer email.
 *
 * @returns the email typed on the Create Event form, or null when the user
 *          has not created an event yet in this browser.
 */
export function readOrganizerEmail(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)?.trim();

    return stored ? stored : null;
  } catch {
    // Storage may be blocked — treat it as "no organizer remembered".
    return null;
  }
}

/** Remembers the organizer email submitted by the Create Event form. */
export function writeOrganizerEmail(email: string): void {
  const trimmed = email.trim();

  if (!trimmed) return;

  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, trimmed);
  } catch {
    // Storage may be full or blocked — the email simply won't be remembered.
    return;
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Subscribes to organizer changes, including ones made in other tabs. */
export function subscribeToOrganizer(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(CHANGE_EVENT, listener);
  // The native storage event only fires in *other* tabs.
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
