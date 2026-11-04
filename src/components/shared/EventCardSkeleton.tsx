import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder card matching the event card layout, shown while loading. */
export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <Skeleton className="h-52 w-full rounded-none" />

      <div className="space-y-3 p-6">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="mt-4 h-10 w-full" />
      </div>
    </div>
  );
}

export default EventCardSkeleton;
