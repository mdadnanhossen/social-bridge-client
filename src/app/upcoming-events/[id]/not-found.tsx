import Link from "next/link";
import { CalendarOff } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Shown when an event id is unknown, malformed, or no longer exists. */
export default function EventNotFound() {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-800">
        <CalendarOff className="size-7" aria-hidden="true" />
      </span>

      <h1 className="font-heading text-2xl font-bold text-navy">
        Event not found
      </h1>

      <p className="text-sm leading-relaxed text-muted-foreground">
        This event may have been removed, or the link is no longer valid. Browse
        the upcoming events to find another drive to join.
      </p>

      <Button
        render={<Link href="/upcoming-events" />}
        className="mt-2 rounded-full px-6"
      >
        Browse Upcoming Events
      </Button>
    </section>
  );
}
