"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Route error boundary for the event details page (must be a client component). */
export default function EventDetailsError({
  error,
  retry,
}: {
  error: (Error & { digest?: string }) | { message: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Error loading the event details:", error);
  }, [error]);

  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertCircle className="size-6" aria-hidden="true" />
      </span>

      <h1 className="font-heading text-2xl font-bold text-navy">
        We couldn&apos;t load this event
      </h1>

      <p className="text-sm leading-relaxed text-muted-foreground">
        Something went wrong while fetching the event details. Please make sure
        the backend server is running on port 5000, then try again.
      </p>

      <Button onClick={retry} className="mt-2 rounded-full px-6">
        <RotateCcw className="mr-2 size-4" />
        Try Again
      </Button>
    </section>
  );
}
