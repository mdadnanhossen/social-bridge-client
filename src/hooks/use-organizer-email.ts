"use client";

import { useSyncExternalStore } from "react";

import {
  readOrganizerEmail,
  subscribeToOrganizer,
} from "@/lib/organizer";

/**
 * Sentinel returned by getServerSnapshot: localStorage cannot be read on the
 * server (or during the hydration render), so "not known yet" is distinct
 * from "known to be empty".
 */
const UNKNOWN = Symbol("organizer-email-unknown");

/**
 * The organizer email this browser is currently acting as.
 *
 * Backed by useSyncExternalStore, so the server render and the hydration
 * render both see UNKNOWN and can never mismatch the HTML React produced.
 * Once the client takes over, the snapshot resolves to the remembered email
 * (falling back to `fallback` when none has been stored) and React re-renders
 * on its own — no setState-in-effect, no flash of the wrong organizer.
 *
 * Wait on `isHydrated` before branching on the email, otherwise you briefly
 * act as the fallback organizer (the same idea as use-joined-events).
 *
 * @param fallback used until an organizer email has been remembered.
 */
export function useOrganizerEmail(fallback: string | null): {
  email: string | null;
  isHydrated: boolean;
} {
  const snapshot = useSyncExternalStore<string | null | typeof UNKNOWN>(
    subscribeToOrganizer,
    () => readOrganizerEmail() ?? fallback,
    () => UNKNOWN
  );

  const isHydrated = snapshot !== UNKNOWN;

  return {
    email: isHydrated ? (snapshot as string | null) : fallback,
    isHydrated,
  };
}
