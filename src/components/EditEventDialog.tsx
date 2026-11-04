"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Image as ImageIcon,
  LoaderCircle,
  MapPin,
  Save,
  Tag,
  Type as TypeIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiUrl } from "@/lib/api";
import { getTokenFromClient } from "@/lib/getTokenFromClient";
import type { DonationEvent } from "@/types";

const DESCRIPTION_MAX = 600;

const eventTypes = [
  "Food Distribution",
  "Clothing Donation",
  "Medical Support",
  "Education Support",
  "Blood Donation",
  "Community Service",
];

interface EditableValues {
  title: string;
  type: string;
  date: string;
  location: string;
  thumbnail: string;
  description: string;
}

type EditErrors = Partial<Record<keyof EditableValues, string>>;

const EMPTY_VALUES: EditableValues = {
  title: "",
  type: "",
  date: "",
  location: "",
  thumbnail: "",
  description: "",
};

function toValues(event: DonationEvent): EditableValues {
  return {
    title: event.title ?? "",
    type: event.type ?? "",
    date: event.date ?? "",
    location: event.location ?? "",
    thumbnail: event.thumbnail ?? "",
    description: event.description ?? "",
  };
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

function validate(values: EditableValues): EditErrors {
  const errors: EditErrors = {};

  if (!values.title.trim()) {
    errors.title = "Event title is required.";
  } else if (values.title.trim().length < 5) {
    errors.title = "Please use at least 5 characters.";
  }

  if (!values.type) {
    errors.type = "Please select an event type.";
  }

  if (!values.date) {
    errors.date = "Event date is required.";
  } else if (!isCalendarDate(values.date)) {
    errors.date = "Please choose a valid date.";
  }

  if (!values.location.trim()) {
    errors.location = "Location or venue is required.";
  } else if (values.location.trim().length < 4) {
    errors.location = "Please add more details to the location.";
  }

  if (!values.thumbnail.trim()) {
    errors.thumbnail = "Thumbnail image URL is required.";
  } else if (!isHttpsUrl(values.thumbnail.trim())) {
    errors.thumbnail = "Please enter a valid HTTPS image URL.";
  }

  if (!values.description.trim()) {
    errors.description = "Event description is required.";
  } else if (values.description.trim().length < 30) {
    errors.description = "Please write at least 30 characters.";
  }

  return errors;
}

/** Events API of the social-bridge backend (see social-bridge-server/index.js). */
const EVENTS_API_URL = apiUrl("/events");

/**
 * Edit dialog for a single event created by the signed-in organizer.
 *
 * The dialog is controlled by the parent (the manage-events page), which is
 * also responsible for the ownership check. This component only sends the
 * update, and the backend re-verifies that the organizer owns the event.
 */
export default function EditEventDialog({
  event,
  open,
  onOpenChange,
  onSaved,
  organizerEmail,
}: {
  /** The event being edited, or null when the dialog is closed. */
  event: DonationEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after the server confirms the update, with the saved values. */
  onSaved: (event: DonationEvent) => void;
  /**
   * The exact identity the Manage Events page filtered by, passed down so the
   * PUT always carries the same email the list is scoped to. The backend
   * compares it against the event's stored email to authorise the update.
   */
  organizerEmail: string | null;
}) {
  const [values, setValues] = useState<EditableValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<EditErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // Re-seed the form whenever a different event is opened. Adjusting state
  // during render (the React-recommended alternative to a setState-in-effect)
  // keeps the form in sync with the prop before it is painted.
  const [seededEvent, setSeededEvent] = useState<DonationEvent | null>(event);

  if (event !== seededEvent) {
    setSeededEvent(event);

    if (event) {
      setValues(toValues(event));
      setErrors({});
      setIsSaving(false);
    }
  }

  function setField(key: keyof EditableValues, value: string) {
    setValues((previous) => ({ ...previous, [key]: value }));

    setErrors((previous) => {
      if (!previous[key]) return previous;

      const next = { ...previous };
      delete next[key];

      return next;
    });
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();

    if (isSaving || !event || !organizerEmail) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the form errors.", {
        description: "Check the highlighted fields and try again.",
      });

      return;
    }

    setIsSaving(true);

    const toastId = toast.loading("Saving your changes...");

    const payload = {
      title: values.title.trim(),
      type: values.type,
      date: values.date,
      location: values.location.trim(),
      thumbnail: values.thumbnail.trim(),
      description: values.description.trim(),
      // The backend uses this to confirm the caller owns the event.
      email: organizerEmail,
    };

    try {
      // Send the real session JWT alongside the ownership claim so the
      // backend can verify *who* is editing instead of trusting a value the
      // client chose. Never sent when there is no token, so behaviour is
      // unchanged for the current backend.
      const token = await getTokenFromClient();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${EVENTS_API_URL}/${event._id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update the event.");
      }

      toast.success("Event updated", {
        id: toastId,
        description: "Your changes have been saved.",
      });

      onSaved({ ...event, ...payload });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating event:", error);

      toast.error("Failed to update the event", {
        id: toastId,
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const thumbnail = values.thumbnail.trim();
  const canPreview = isHttpsUrl(thumbnail);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>

          <DialogDescription>
            Update the details of your event. Visitors will see these changes
            right away.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit} className="grid gap-4">
          {/* Event title */}
          <div>
            <label
              htmlFor="edit-event-title"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Event Title <span className="text-red-500">*</span>
            </label>

            <div className="flex h-11 items-center rounded-lg border border-gray-200 px-3 focus-within:border-green-700">
              <TypeIcon className="mr-3 size-5 text-gray-400" />

              <input
                id="edit-event-title"
                required
                value={values.title}
                onChange={(e) => setField("title", e.target.value)}
                className="h-full w-full bg-transparent text-sm outline-none"
              />
            </div>

            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Event type + date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-event-type"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Event Type <span className="text-red-500">*</span>
              </label>

              <div className="flex h-11 items-center rounded-lg border border-gray-200 px-3">
                <Tag className="mr-3 size-5 text-gray-400" />

                <select
                  id="edit-event-type"
                  required
                  value={values.type}
                  onChange={(e) => setField("type", e.target.value)}
                  className="h-full w-full bg-transparent text-sm outline-none"
                >
                  <option value="">Select an event type</option>

                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {errors.type && (
                <p className="mt-1 text-sm text-red-500">{errors.type}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-event-date"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Event Date <span className="text-red-500">*</span>
              </label>

              <div className="flex h-11 items-center rounded-lg border border-gray-200 px-3">
                <CalendarDays className="mr-3 size-5 text-gray-400" />

                <input
                  id="edit-event-date"
                  type="date"
                  required
                  value={values.date}
                  onChange={(e) => setField("date", e.target.value)}
                  className="h-full w-full bg-transparent text-sm outline-none"
                />
              </div>

              {errors.date && (
                <p className="mt-1 text-sm text-red-500">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="edit-event-location"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Location / Venue <span className="text-red-500">*</span>
            </label>

            <div className="flex h-11 items-center rounded-lg border border-gray-200 px-3">
              <MapPin className="mr-3 size-5 text-gray-400" />

              <input
                id="edit-event-location"
                required
                value={values.location}
                onChange={(e) => setField("location", e.target.value)}
                className="h-full w-full bg-transparent text-sm outline-none"
              />
            </div>

            {errors.location && (
              <p className="mt-1 text-sm text-red-500">{errors.location}</p>
            )}
          </div>

          {/* Thumbnail */}
          <div>
            <label
              htmlFor="edit-event-thumbnail"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Thumbnail Image URL <span className="text-red-500">*</span>
            </label>

            <div className="flex h-11 items-center rounded-lg border border-gray-200 px-3">
              <ImageIcon className="mr-3 size-5 text-gray-400" />

              <input
                id="edit-event-thumbnail"
                type="url"
                required
                value={values.thumbnail}
                onChange={(e) => setField("thumbnail", e.target.value)}
                className="h-full w-full bg-transparent text-sm outline-none"
              />
            </div>

            {canPreview && (
              <div className="relative mt-3 w-full max-w-xs overflow-hidden rounded-xl">
                <img
                  src={thumbnail}
                  alt="Event thumbnail preview"
                  className="aspect-video w-full object-cover"
                />
              </div>
            )}

            {errors.thumbnail && (
              <p className="mt-1 text-sm text-red-500">{errors.thumbnail}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="edit-event-description"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Event Description <span className="text-red-500">*</span>
            </label>

            <textarea
              id="edit-event-description"
              required
              minLength={30}
              maxLength={DESCRIPTION_MAX}
              value={values.description}
              onChange={(e) => setField("description", e.target.value)}
              className="min-h-28 w-full resize-y rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-green-700"
            />

            <div className="flex justify-end">
              <span className="text-xs text-gray-500">
                {values.description.length}/{DESCRIPTION_MAX}
              </span>
            </div>

            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
              className="bg-green-800 font-semibold text-white hover:bg-green-900"
            >
              {isSaving ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}

              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
