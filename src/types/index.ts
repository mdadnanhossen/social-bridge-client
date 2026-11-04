import type { LucideIcon } from "lucide-react";

/** A single navigation link (navbar or footer). */
export interface NavLink {
  label: string;
  href: string;
}

/** A headline statistic shown in the hero or the impact section. */
export interface StatItem {
  value: string;
  label: string;
  icon: LucideIcon;
}

/** A charity event card. */
export interface EventItem {
  id: number;
  title: string;
  category: string;
  location: string;
  date: string;
  description: string;
  volunteers: number;
  image: string;
}

/** A step of the "How it works" process. */
export interface StepItem {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

/** A core value shown in the mission section. */
export interface ValueItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

/** How an image is placed inside the gallery bento grid. */
export type GalleryLayout = "large" | "wide" | "normal";

/** A photo shown in the gallery section. */
export interface GalleryItem {
  src: string;
  alt: string;
  caption: string;
  layout: GalleryLayout;
}

/** A volunteer testimonial. */
export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar: string;
}

/** A social media profile link shown in the footer. */
export interface SocialLink {
  label: string;
  href: string;
}

/** A selectable event type offered on the create-event form. */
export interface EventTypeOption {
  label: string;
  icon: LucideIcon;
}

/** A ready-made thumbnail image offered as a quick preset on the create-event form. */
export interface ImagePreset {
  label: string;
  url: string;
}

/** The signed-in organizer whose email is attached to a created event. */
export interface CurrentUser {
  name: string;
  email: string;
}

/** A donation event document as stored in MongoDB by the backend. */
export interface DonationEvent {
  _id: string;
  title: string;
  /** Event type, e.g. "Food Distribution" or "Blood Donation". */
  type?: string;
  /** Event day, stored by the create-event form as "YYYY-MM-DD". */
  date: string;
  location?: string;
  /** HTTPS URL of the event thumbnail. */
  thumbnail?: string;
  description?: string;
  /** Organizer email — decides who may update or delete the event. */
  email?: string;
}
