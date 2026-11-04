
"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarOff,
  RotateCcw,
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SectionHeading } from "@/components/shared/SectionHeading";
import UpcomingEventCard from "@/components/shared/UpcomingEventCard";
import EventCardSkeleton from "@/components/shared/EventCardSkeleton";
import { useUpcomingEvents } from "@/hooks/use-upcoming-events";

// Event categories
const CATEGORIES = [
  "All",
  "Food Distribution",
  "Clothing Donation",
  "Medical Support",
  "Education Support",
  "Blood Donation",
  "Community Service",
];

const SKELETON_CARD_COUNT = 6;

export default function UpcomingEventsPage() {
  const { status, events, errorMessage, retry } = useUpcomingEvents();

  // Search and category states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter events based on category and search
  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return events.filter((event) => {
      // Category filtering
      const matchesCategory =
        selectedCategory === "All" ||
        event.type?.trim().toLowerCase() ===
          selectedCategory.trim().toLowerCase();

      // Search filtering
      const matchesSearch =
        !query ||
        [
          event.title,
          event.location,
          event.description,
          event.type,
        ]
          .filter(Boolean)
          .some((value) =>
            value!.toLowerCase().includes(query)
          );

      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchQuery]);

  // Clear search and category filters
  const clearFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
  };

  return (
    <section
      aria-labelledby="upcoming-events-heading"
      className="relative overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-32 size-80 rounded-full bg-green-100/60 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-20 size-72 rounded-full bg-amber-100/70 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Heading */}
        <SectionHeading
          headingId="upcoming-events-heading"
          eyebrow="Upcoming Events"
          title="Join the Next Good Deed"
          description="Every event listed here is happening today or later. Find one near you and lend a hand."
        />

        <div className="mt-10" aria-busy={status === "loading"}>
          {/* Loading State */}
          {status === "loading" && (
            <>
              <p className="sr-only" role="status">
                Loading upcoming events…
              </p>

              <ul
                aria-hidden="true"
                className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
              >
                {Array.from(
                  { length: SKELETON_CARD_COUNT },
                  (_, index) => (
                    <li key={index} className="h-full">
                      <EventCardSkeleton />
                    </li>
                  )
                )}
              </ul>
            </>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl bg-white p-10 text-center shadow-xl ring-1 ring-black/5">
              <span className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertCircle className="size-6" aria-hidden="true" />
              </span>

              <h3 className="font-heading text-xl font-semibold text-navy">
                We couldn&apos;t load the events
              </h3>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {errorMessage ? `${errorMessage} ` : ""}
                Please make sure the backend server is running on port
                5000, then try again.
              </p>

              <Button
                onClick={retry}
                className="mt-2 rounded-full px-6"
              >
                <RotateCcw className="mr-2 size-4" />
                Try Again
              </Button>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <>
              {events.length === 0 ? (
                // No events available in database
                <Empty className="min-h-72 rounded-3xl border bg-white shadow-sm">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CalendarOff />
                    </EmptyMedia>

                    <EmptyTitle>
                      No upcoming events right now
                    </EmptyTitle>

                    <EmptyDescription>
                      There are no donation events scheduled for today or
                      later. Check back soon — new events are added regularly.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <>
                  {/* Filter and Search Section */}
                  <div className="mb-8 space-y-5">
                    {/* Category Filter */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal
                          className="size-4 text-brand-800"
                          aria-hidden="true"
                        />

                        <span className="text-sm font-semibold text-navy">
                          Filter by category
                        </span>
                      </div>

                      {/* Category Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((category) => {
                          const isActive =
                            selectedCategory === category;

                          return (
                            <button
                              key={category}
                              type="button"
                              aria-pressed={isActive}
                              onClick={() =>
                                setSelectedCategory(category)
                              }
                              className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                                isActive
                                  ? "border-brand-800 bg-brand-800 text-white shadow-sm"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-700 hover:bg-brand-50 hover:text-brand-800"
                              }`}
                            >
                              {category}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-muted-foreground">
                        Showing{" "}
                        <span className="font-semibold text-navy">
                          {filteredEvents.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-navy">
                          {events.length}
                        </span>{" "}
                        events
                      </p>

                      <div className="relative w-full sm:max-w-sm">
                        <Search
                          className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                          aria-hidden="true"
                        />

                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(e) =>
                            setSearchQuery(e.target.value)
                          }
                          placeholder="Search events or areas..."
                          aria-label="Search events by title, location or description"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-navy shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10"
                        />

                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            <X className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Active Filter Information */}
                    {(selectedCategory !== "All" || searchQuery) && (
                      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                        <span className="text-xs text-muted-foreground">
                          Active filters:
                        </span>

                        {selectedCategory !== "All" && (
                          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
                            {selectedCategory}
                          </span>
                        )}

                        {searchQuery && (
                          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
                            Search: {searchQuery}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={clearFilters}
                          className="ml-auto text-xs font-semibold text-red-600 transition hover:text-red-700"
                        >
                          Clear all filters
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Filtered Event Cards */}
                  {filteredEvents.length > 0 ? (
                    <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredEvents.map((event) => (
                        <li key={event._id} className="h-full">
                          <UpcomingEventCard event={event} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    // No matching search/category result
                    <Empty className="min-h-72 rounded-3xl border bg-white shadow-sm">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Search />
                        </EmptyMedia>

                        <EmptyTitle>
                          No matching events found
                        </EmptyTitle>

                        <EmptyDescription>
                          We couldn&apos;t find any events matching your
                          search or selected category. Try another keyword
                          or clear your filters.
                        </EmptyDescription>
                      </EmptyHeader>

                      <Button
                        type="button"
                        onClick={clearFilters}
                        variant="outline"
                        className="mt-2 rounded-full px-6"
                      >
                        <RotateCcw className="mr-2 size-4" />
                        Clear Filters
                      </Button>
                    </Empty>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
