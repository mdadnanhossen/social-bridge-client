"use client";

import { useMemo, useSyncExternalStore } from "react";

import {
  readJoinedEvents,
  subscribeToJoinedEvents,
  type JoinedEvent,
} from "@/lib/joined-events";

/**
 * Sentinel returned by getServerSnapshot: localStorage cannot be read on the
 * server (or during the hydration render), so "not known yet" is distinct
 * from "known to be empty".
 */
const UNKNOWN = Symbol("joined-events-unknown");

/** Stable empty list for the server render, so memoized values stay stable. */
const NO_EVENTS: JoinedEvent[] = [];

/**
 * Cache for getSnapshot. readJoinedEvents() always builds a fresh array, and
 * useSyncExternalStore requires the snapshot to be referentially stable while
 * nothing has actually changed — otherwise React loops.
 */
let cachedSnapshot: JoinedEvent[] = NO_EVENTS;

function sameEvents(a: JoinedEvent[], b: JoinedEvent[]): boolean {
  if (a.length !== b.length) return false;

  return a.every(
    (event, index) =>
      event.id === b[index].id &&
      event.title === b[index].title &&
      event.joinedAt === b[index].joinedAt
  );
}

function getSnapshot(): JoinedEvent[] {
  const next = readJoinedEvents();

  if (!sameEvents(cachedSnapshot, next)) {
    cachedSnapshot = next;
  }

  return cachedSnapshot;
}

function getServerSnapshot(): JoinedEvent[] | typeof UNKNOWN {
  return UNKNOWN;
}

/**
 * React view of the locally stored volunteer sign-ups.
 *
 * Backed by useSyncExternalStore (the same shape as use-organizer-email), so
 * the server render and the hydration render both see UNKNOWN and can never
 * mismatch the HTML React produced. Once the client takes over the snapshot
 * resolves to the stored sign-ups and React re-renders on its own — no
 * setState-in-effect, no flash of the wrong list.
 *
 * Wait on `isHydrated` before branching on the list, otherwise you briefly
 * render the empty state.
 */
export function useJoinedEvents() {
  const snapshot = useSyncExternalStore(
    subscribeToJoinedEvents,
    getSnapshot,
    getServerSnapshot
  );

  const isHydrated = snapshot !== UNKNOWN;
  const events = isHydrated ? (snapshot as JoinedEvent[]) : NO_EVENTS;

  const joinedIds = useMemo(
    () => new Set(events.map((event) => event.id)),
    [events]
  );

  return { events, joinedIds, isHydrated };
}
