"use client";

import { toast } from "sonner";
import { Check, HeartHandshake, Share2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useJoinedEvents } from "@/hooks/use-joined-events";
import { toggleEventJoin } from "@/lib/joined-events";


export default function EventJoinBar({
  id,
  title,
  volunteers,
}: {
  id: string;
  title: string;
  volunteers: number;
}) {
  const { joinedIds } = useJoinedEvents();
  const hasJoined = joinedIds.has(id);

  const joinedCount = volunteers + (hasJoined ? 1 : 0);

  async function handleShare() {
    const shareData = {
      title,
      text: `Join me at "${title}" on SocialBridge.`,
      url: window.location.href,
    };

    try {
      if (typeof navigator.share === "function") {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareData.url);
      toast.success("Link copied", {
        description: "Share it with friends who want to volunteer.",
      });
    } catch (error) {
      // The user dismissed the native share sheet — nothing to report.
      if (error instanceof DOMException && error.name === "AbortError") return;

      toast.error("Could not share this event", {
        description: "Please copy the URL from the address bar instead.",
      });
    }
  }

  function handleJoin() {
    const nowJoined = toggleEventJoin({
      id,
      title,
      joinedAt: new Date().toISOString(),
    });

    if (nowJoined) {
      toast.success("You're in!", {
        description: `Thanks for signing up for ${title}.`,
      });
    } else {
      toast.info("You left the event", {
        description: "You can join again anytime.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-800"
        >
          <Users className="size-6" />
        </span>

        <div>
          <p className="font-heading text-lg font-bold text-navy">
            {joinedCount} {joinedCount === 1 ? "Volunteer" : "Volunteers"} Joined
          </p>
          <p className="text-sm text-muted-foreground">
            Sign up to join hands for this drive
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleShare}
          aria-label="Share this event"
          className="size-11 rounded-xl px-0"
        >
          <Share2 className="size-4" />
        </Button>

        <Button
          type="button"
          onClick={handleJoin}
          aria-pressed={hasJoined}
          className={
            hasJoined
              ? "h-12 gap-2 rounded-xl bg-brand-50 px-6 font-semibold text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100"
              : "h-12 gap-2 rounded-xl bg-brand-800 px-6 font-semibold text-white hover:bg-brand-900"
          }
        >
          {hasJoined ? (
            <>
              <Check className="size-4" />
              Joined
            </>
          ) : (
            <>
              <HeartHandshake className="size-4" />
              Join Event
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
