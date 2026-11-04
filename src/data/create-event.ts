import {
  Droplet,
  Heart,
  Shirt,
  Sparkles,
  Trees,
  UtensilsCrossed,
} from "lucide-react";

import type { CurrentUser, EventTypeOption, ImagePreset } from "@/types";

// Unsplash image URL helper (same approach as src/data/home.ts)
const imageUrl = (id: string, width = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

// Event types an organizer can pick from (Demo data)
export const eventTypes: EventTypeOption[] = [
  { label: "Donation", icon: Heart },
  { label: "Food Distribution", icon: UtensilsCrossed },
  { label: "Clothing Drive", icon: Shirt },
  { label: "Blood Donation", icon: Droplet },
  { label: "Environmental Cleanup", icon: Trees },
  { label: "Other", icon: Sparkles },
];

// Quick thumbnail presets shown under the image URL field (Demo data).
// They reuse photos already featured across the site so they always load.
export const imagePresets: ImagePreset[] = [
  {
    label: "Winter Clothes",
    url: imageUrl("photo-1469571486292-0ba58a3f068b"),
  },
  {
    label: "Blanket Relief",
    url: imageUrl("photo-1532629345422-7515f3d16bb6"),
  },
  {
    label: "Food Drive",
    url: imageUrl("photo-1488521787991-ed7bbaae773c"),
  },
  {
    label: "Volunteers",
    url: imageUrl("photo-1559027615-cd4628902d4a"),
  },
];

// Demo signed-in user until the auth backend is connected.
// Set this to `null` and the form falls back to an editable organizer email field.
export const currentUser: CurrentUser | null = {
  name: "Rakib Hasan",
  email: "rakib.hasan@socialbridge.org",
};
