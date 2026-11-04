
"use client";


import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Image as ImageIcon,
  LoaderCircle,
  Mail,
  MapPin,
  RotateCcw,
  Sparkles,
  Tag,
  Type as TypeIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiUrl } from "@/lib/api";
import { writeOrganizerEmail } from "@/lib/organizer";
import { getTokenFromClient } from "@/lib/getTokenFromClient";

const DESCRIPTION_MAX = 600;

const FIELD_IDS = {
  title: "event-title",
  type: "event-type",
  date: "event-date",
  location: "event-location",
  thumbnail: "event-thumbnail",
  description: "event-description",
  email: "organizer-email",
} as const;

type FormKey = keyof typeof FIELD_IDS;

interface FormValues {
  title: string;
  type: string;
  date: string;
  location: string;
  thumbnail: string;
  description: string;
  email: string;
}

type FormErrors = Partial<Record<FormKey, string>>;

const EMPTY_VALUES: FormValues = {
  title: "",
  type: "",
  date: "",
  location: "",
  thumbnail: "",
  description: "",
  email: "",
};

// The organizer email is entered manually on this form. On submit it is
// remembered in localStorage (see src/lib/organizer.ts) so the Manage Events
// page can filter by the same identity, and so Edit/Delete send an email the
// backend will accept for the ownership check.

const eventTypes = [
  "Food Distribution",
  "Clothing Donation",
  "Medical Support",
  "Education Support",
  "Blood Donation",
  "Community Service",
];

const imagePresets = [
  {
    label: "Food Donation",
    url: "https://images.unsplash.com/photo-1593113598332-cd288d649433",
  },
  {
    label: "Education",
    url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
  },
  {
    label: "Community",
    url: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8",
  },
];

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

function getToday(): string {
  const now = new Date();

  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

/** Nothing to subscribe to: the client date only needs to be read once. */
function subscribeToToday(): () => void {
  return () => {};
}

/**
 * Today's date in the *browser's* timezone.
 *
 * Exposed through useSyncExternalStore so the server render (and the hydration
 * render) both see an empty string and can never mismatch the HTML React
 * produced; React re-renders with the real date on its own afterwards. This is
 * the same approach as use-organizer-email and avoids a setState-in-effect.
 */
function useToday(): string {
  return useSyncExternalStore(subscribeToToday, getToday, () => "");
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

function validate(
  values: FormValues,
  today: string
): FormErrors {
  const errors: FormErrors = {};

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
  } else if (today && values.date < today) {
    errors.date = "The date must be today or a future date.";
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

  if (!values.email.trim()) {
    errors.email = "Organizer email is required.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  return errors;
}

export default function CreateEventForm() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const today = useToday();

  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedPreview, setFailedPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

 
 
  const [prefilledEmail, setPrefilledEmail] = useState<string | undefined>(
    undefined
  );

  if (user?.email && prefilledEmail === undefined) {
    setPrefilledEmail(user.email);
    setValues((previous) =>
      previous.email ? previous : { ...previous, email: user.email as string }
    );
  }

  const thumbnail = values.thumbnail.trim();
  const canPreview = isHttpsUrl(thumbnail);
  const previewFailed = failedPreview === thumbnail;

  function setField(key: FormKey, value: string) {
    setValues((previous) => ({
      ...previous,
      [key]: value,
    }));

    setErrors((previous) => {
      if (!previous[key]) return previous;

      const next = { ...previous };
      delete next[key];

      return next;
    });
  }

  function applyPreset(url: string) {
    setField("thumbnail", url);
    setFailedPreview(null);
  }

  function handleReset() {
    setValues(EMPTY_VALUES);
    setErrors({});
    setFailedPreview(null);
  }

 async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (isSubmitting) return;

  if (!today) {
    toast.info("Please wait while the form is initializing.");
    return;
  }

  const nextErrors = validate(values, today);
  setErrors(nextErrors);

  if (Object.keys(nextErrors).length > 0) {
    const firstInvalid = Object.keys(nextErrors)[0] as FormKey;

    document.getElementById(FIELD_IDS[firstInvalid])?.focus();

    toast.error("Please fix the form errors.", {
      description: "Check the highlighted fields and try again.",
    });

    return;
  }

  setIsSubmitting(true);

  const toastId = toast.loading("Creating your event...");

  try {
    const eventData = {
      title: values.title.trim(),
      type: values.type,
      date: values.date,
      location: values.location.trim(),
      thumbnail: values.thumbnail.trim(),
      description: values.description.trim(),
      // The organizer identity typed on this form. Manage Events filters by
      // it and Edit/Delete send it to the backend's ownership check.
      email: values.email.trim(),
    };

    const token = await getTokenFromClient();

    const response = await fetch(
      apiUrl("/create-event"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create event.");
    }

    // Remember who created it so Manage Events shows exactly these events
    // (and Edit/Delete send an email the backend will accept).
    writeOrganizerEmail(eventData.email);

    toast.success("Event created successfully!", {
      id: toastId,
      description: "Your community event has been created.",
    });

    setValues(EMPTY_VALUES);
    setErrors({});
    setFailedPreview(null);

  } catch (error) {
    console.error("Error creating event:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";

    toast.error("Failed to create event!", {
      id: toastId,
      description: message,
    });

  } finally {
    setIsSubmitting(false);
  }
}
  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-32 size-80 rounded-full bg-green-100/60 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-20 size-72 rounded-full bg-amber-100/70 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <Link
          href="/upcoming-events"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:text-green-900"
        >
          <ArrowLeft className="size-4" />
          Back to Upcoming Events
        </Link>

        <form
          noValidate
          onSubmit={handleSubmit}
          aria-labelledby="create-event-heading"
          className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-black/5 sm:p-10"
        >
          {/* Heading */}
          <header className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-green-800">
              <Sparkles className="size-3.5 text-amber-600" />
              Social Service Drive
            </span>

            <h1
              id="create-event-heading"
              className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              Create a Community Event
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg">
              Organize a local relief effort, environmental cleanup, or
              community support drive and rally volunteers around your cause.
            </p>
          </header>

          {/* Form fields */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-7">
            {/* Event title */}
            <div className="sm:col-span-2">
              <label
                htmlFor={FIELD_IDS.title}
                className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-800"
              >
                Event Title <span className="text-red-500">*</span>
              </label>

              <div className="flex h-11 items-center rounded-lg border border-gray-200 px-3 focus-within:border-green-700">
                <TypeIcon className="mr-3 size-5 text-gray-400" />

                <input
                  id={FIELD_IDS.title}
                  required
                  value={values.title}
                  onChange={(event) =>
                    setField("title", event.target.value)
                  }
                  placeholder="e.g. Winter Clothes Distribution"
                  className="h-full w-full bg-transparent text-sm outline-none"
                />
              </div>

              {errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Event type */}
            <div>
              <label
                htmlFor={FIELD_IDS.type}
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Event Type <span className="text-red-500">*</span>
              </label>

              <div className="flex h-11 items-center rounded-lg border border-gray-200 px-3">
                <Tag className="mr-3 size-5 text-gray-400" />

                <select
                  id={FIELD_IDS.type}
                  required
                  value={values.type}
                  onChange={(event) =>
                    setField("type", event.target.value)
                  }
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
                <p className="mt-1 text-sm text-red-500">
                  {errors.type}
                </p>
              )}
            </div>

            {/* Event date */}
            <div>
              <label
                htmlFor={FIELD_IDS.date}
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Event Date <span className="text-red-500">*</span>
              </label>

              <div className="flex h-11 items-center rounded-lg border border-gray-200 px-3">
                <CalendarDays className="mr-3 size-5 text-gray-400" />

                <input
                  id={FIELD_IDS.date}
                  type="date"
                  required
                  min={today || undefined}
                  value={values.date}
                  onChange={(event) =>
                    setField("date", event.target.value)
                  }
                  className="h-full w-full bg-transparent text-sm outline-none"
                />
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Choose today or a future date.
              </p>

              {errors.date && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.date}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="sm:col-span-2">
              <label
                htmlFor={FIELD_IDS.location}
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Location / Venue <span className="text-red-500">*</span>
              </label>

              <div className="flex h-11 items-center rounded-lg border border-gray-200 px-3">
                <MapPin className="mr-3 size-5 text-gray-400" />

                <input
                  id={FIELD_IDS.location}
                  required
                  value={values.location}
                  onChange={(event) =>
                    setField("location", event.target.value)
                  }
                  placeholder="e.g. Mohammadpur Town Hall, Dhaka"
                  className="h-full w-full bg-transparent text-sm outline-none"
                />
              </div>

              {errors.location && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.location}
                </p>
              )}
            </div>

            {/* Thumbnail URL */}
            <div className="sm:col-span-2">
              <label
                htmlFor={FIELD_IDS.thumbnail}
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Thumbnail Image URL <span className="text-red-500">*</span>
              </label>

              <div className="flex h-11 items-center rounded-lg border border-gray-200 px-3">
                <ImageIcon className="mr-3 size-5 text-gray-400" />

                <input
                  id={FIELD_IDS.thumbnail}
                  type="url"
                  required
                  value={values.thumbnail}
                  onChange={(event) => {
                    setField("thumbnail", event.target.value);
                    setFailedPreview(null);
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="h-full w-full bg-transparent text-sm outline-none"
                />
              </div>

              {/* Image presets */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span>Quick photo presets:</span>

                {imagePresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset.url)}
                    className="font-medium text-green-700 underline-offset-4 hover:underline"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Image preview */}
              {canPreview && (
                <div className="mt-4">
                  {previewFailed ? (
                    <p className="text-sm text-red-500">
                      This image could not be loaded. Please check the URL.
                    </p>
                  ) : (
                    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl">
                      <img
                        src={thumbnail}
                        alt="Event thumbnail preview"
                        onError={() => setFailedPreview(thumbnail)}
                        className="aspect-video w-full object-cover"
                      />

                      <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-900">
                        Preview
                      </span>
                    </div>
                  )}
                </div>
              )}

              {errors.thumbnail && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.thumbnail}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label
                htmlFor={FIELD_IDS.description}
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Event Description <span className="text-red-500">*</span>
              </label>

              <textarea
                id={FIELD_IDS.description}
                required
                minLength={30}
                maxLength={DESCRIPTION_MAX}
                value={values.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
                placeholder="Explain the purpose of the event, volunteers required, items being distributed or tasks to complete..."
                className="min-h-32 w-full resize-y rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-green-700"
              />

              <div className="flex items-start justify-between gap-4">
                <p className="text-xs text-gray-500">
                  Share the goal, meeting point, and what volunteers should
                  bring.
                </p>

                <span className="shrink-0 text-xs text-gray-500">
                  {values.description.length}/{DESCRIPTION_MAX}
                </span>
              </div>

              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Organizer email — always typed by hand */}
            <div className="sm:col-span-2">
              <label
                htmlFor={FIELD_IDS.email}
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Organizer Email <span className="text-red-500">*</span>
              </label>

              <div className="flex h-11 items-center rounded-lg border border-gray-200 px-3 focus-within:border-green-700">
                <Mail className="mr-3 size-5 text-gray-400" />

                <input
                  id={FIELD_IDS.email}
                  type="email"
                  required
                  value={values.email}
                  onChange={(event) =>
                    setField("email", event.target.value)
                  }
                  placeholder="organizer@example.com"
                  className="h-full w-full bg-transparent text-sm outline-none"
                />
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Use the same organizer email each time — Manage My Events and
                the edit/delete actions are keyed to it.
              </p>

              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Form actions */}
          <div className="mt-8 flex flex-col gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-xs leading-relaxed text-gray-500">
              Your event details will be ready to submit. Please double-check
              every detail before continuing.
            </p>

            <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
                className="rounded-full sm:px-6"
              >
                <RotateCcw className="mr-2 size-4" />
                Clear
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || !today}
                className="h-12 w-full rounded-full bg-green-800 px-8 font-semibold text-white hover:bg-green-900 sm:w-auto"
              >
                {isSubmitting ? (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 size-4" />
                )}

                {isSubmitting ? "Creating event..." : "Create Event"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
