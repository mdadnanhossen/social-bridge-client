"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchUpcomingEvents,
  type DonationEvent,
  type LoadStatus,
} from "@/lib/events";

interface UpcomingEventsState {
  /** loading while the request runs, then success or error. */
  status: LoadStatus;
  /** Events dated today or later, nearest date first. */
  events: DonationEvent[];
  /** Human-readable failure reason while `status` is "error". */
  errorMessage: string | null;
  /** Refetches the list — wired to the "Try Again" buttons. */
  retry: () => void;
}

/**
 * Loads the upcoming events once per mount and whenever `retry` is called.
 *
 * Shared by the homepage's FeaturedEvents section and the Upcoming Events
 * page so both always show the same, freshly created events.
 */
export function useUpcomingEvents(): UpcomingEventsState {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [events, setEvents] = useState<DonationEvent[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bumped by the "Try again" button to refetch after a failure.
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setStatus("loading");

      try {
        const upcoming = await fetchUpcomingEvents(controller.signal);

        setEvents(upcoming);
        setErrorMessage(null);
        setStatus("success");
      } catch (error) {
        // Ignore aborted requests (e.g. React StrictMode remounts).
        if (controller.signal.aborted) return;

        console.error("Error fetching upcoming events:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong while fetching the events."
        );
        setStatus("error");
      }
    }

    void loadEvents();

    return () => controller.abort();
  }, [reloadKey]);

  return { status, events, errorMessage, retry };
}

export default useUpcomingEvents;
