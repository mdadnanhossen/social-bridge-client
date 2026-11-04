
import {
  Users,
  CalendarCheck,
  HeartHandshake,
  MapPin,
  Search,
  UserPlus,
  Sparkles,
  HandHeart,
  Globe,
} from "lucide-react";

import type {
  NavLink,
  StatItem,
  EventItem,
  StepItem,
  ValueItem,
  GalleryItem,
  Testimonial,
  SocialLink,
} from "@/types";

// Unsplash image URL helper
const imageUrl = (id: string, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

// Navbar links — the center nav only surfaces Upcoming Events; Joined Events,
// Manage Events, and Create Event live in the profile dropdown instead.
export const navLinks: NavLink[] = [
  { label: "Upcoming Events", href: "/upcoming-events" },
];

// Hero images
export const heroImage = imageUrl("photo-1593113598332-cd288d649433", 1400);
export const missionImage = imageUrl("photo-1559027615-cd4628902d4a", 1200);

// Hero statistics (Demo data)
export const heroStats = [
  { value: "1,200+", label: "Volunteers" },
  { value: "85+", label: "Events Completed" },
  { value: "3,500+", label: "Lives Impacted" },
];

// Homepage impact statistics (Demo data)
export const impactStats: StatItem[] = [
  { value: "1,200+", label: "Active Volunteers", icon: Users },
  { value: "85+", label: "Community Events", icon: CalendarCheck },
  { value: "3,500+", label: "People Helped", icon: HeartHandshake },
  { value: "25+", label: "Cities Reached", icon: MapPin },
];

// Upcoming charity events (Demo data)
export const events: EventItem[] = [
  {
    id: 1,
    title: "Winter Clothes Distribution",
    category: "Clothing Drive",
    location: "Mirpur, Dhaka",
    date: "Dec 14, 2026",
    description:
      "Help us distribute warm clothes to underprivileged families during winter.",
    volunteers: 48,
    image: imageUrl("photo-1469571486292-0ba58a3f068b", 800),
  },
  {
    id: 2,
    title: "Food Distribution for Street Children",
    category: "Food Relief",
    location: "Khulna",
    date: "Dec 20, 2026",
    description:
      "Join us to prepare and distribute nutritious meals to children in need.",
    volunteers: 36,
    image: imageUrl("photo-1488521787991-ed7bbaae773c", 800),
  },
  {
    id: 3,
    title: "Free Medical Camp",
    category: "Healthcare",
    location: "Mohammadpur, Dhaka",
    date: "Dec 27, 2026",
    description:
      "Support a free medical camp for low-income families and patients.",
    volunteers: 60,
    image: imageUrl("photo-1576091160399-112ba8d25d1d", 800),
  },
  {
    id: 4,
    title: "Blanket Distribution for Poor Families",
    category: "Winter Relief",
    location: "Rajshahi",
    date: "Jan 05, 2027",
    description:
      "Help deliver warm blankets to families who need support during winter.",
    volunteers: 42,
    image: imageUrl("photo-1532629345422-7515f3d16bb6", 800),
  },
  {
    id: 5,
    title: "Community Food Drive",
    category: "Food Relief",
    location: "Sylhet",
    date: "Jan 12, 2027",
    description:
      "Collect and distribute essential food packages to underprivileged households.",
    volunteers: 55,
    image: imageUrl("photo-1509099836639-18ba1795216d", 800),
  },
  {
    id: 6,
    title: "Support Flood-Affected Families",
    category: "Emergency Aid",
    location: "Feni",
    date: "Jan 18, 2027",
    description:
      "Help provide emergency relief supplies and clean water to affected families.",
    volunteers: 80,
    image: imageUrl("photo-1593113598332-cd288d649433", 800),
  },
];

// How it works section
export const steps: StepItem[] = [
  {
    number: "01",
    title: "Discover Events",
    description:
      "Explore social development events happening around your community.",
    icon: Search,
  },
  {
    number: "02",
    title: "Join the Community",
    description:
      "Register for events and connect with people who want to help.",
    icon: UserPlus,
  },
  {
    number: "03",
    title: "Make an Impact",
    description:
      "Participate in activities and make a positive difference in people's lives.",
    icon: Sparkles,
  },
];

// Our core values
export const values: ValueItem[] = [
  {
    title: "Compassion",
    description:
      "We help people with kindness, dignity, and respect.",
    icon: HandHeart,
  },
  {
    title: "Community",
    description:
      "We believe positive change starts when people work together.",
    icon: Users,
  },
  {
    title: "Positive Impact",
    description:
      "Every small contribution can help create a better future.",
    icon: Globe,
  },
];

// Gallery images (Demo content) laid out in a bento-style grid
export const gallery: GalleryItem[] = [
  {
    src: imageUrl("photo-1469571486292-0ba58a3f068b", 900),
    alt: "Volunteers sorting and handing out clothes to families",
    caption: "Clothes distribution",
    layout: "large",
  },
  {
    src: imageUrl("photo-1509099836639-18ba1795216d", 900),
    alt: "Volunteers preparing food packages for the community",
    caption: "Food distribution",
    layout: "wide",
  },
  {
    src: imageUrl("photo-1581579438747-1dc8d17bbce4", 600),
    alt: "A volunteer offering a helping hand to an elderly person",
    caption: "Helping elderly people",
    layout: "normal",
  },
  {
    src: imageUrl("photo-1559027615-cd4628902d4a", 600),
    alt: "Volunteers working side by side while unloading donation boxes",
    caption: "Volunteers together",
    layout: "normal",
  },
  {
    src: imageUrl("photo-1532629345422-7515f3d16bb6", 900),
    alt: "Community members taking part in a local charity activity",
    caption: "Community activities",
    layout: "wide",
  },
  {
    src: imageUrl("photo-1488521787991-ed7bbaae773c", 900),
    alt: "Volunteers spending time with and helping children",
    caption: "Helping children",
    layout: "wide",
  },
];

// Testimonials (Demo content - replace with real feedback)
export const testimonials: Testimonial[] = [
  {
    name: "Nusrat Jahan",
    role: "Event Volunteer",
    quote:
      "Joining a food drive was a meaningful experience. Working together showed me how small efforts can make a difference.",
    rating: 5,
    avatar: imageUrl("photo-1494790108377-be9c29b29330", 200),
  },
  {
    name: "Rakib Hasan",
    role: "Team Coordinator",
    quote:
      "Helping organize community events has been a rewarding experience. It feels great to work with people who care.",
    rating: 5,
    avatar: imageUrl("photo-1507003211169-0a1dd7228f2d", 200),
  },
  {
    name: "Farzana Akter",
    role: "Medical Camp Volunteer",
    quote:
      "Volunteering reminded me that even a little help can bring happiness to someone.",
    rating: 4,
    avatar: imageUrl("photo-1438761681033-6461ffad8d80", 200),
  },
];

// Contact information
// Replace these placeholders with real project contact details.
export const contactInfo = {
  address: "House 14, Road 5, Dhanmondi, Dhaka 1205, Bangladesh",
  phone: "+880 1711-234567",
  email: "hello@socialbridge.org",
};

// Social media profiles (demo links)
export const socialLinks: SocialLink[] = [
  { label: "Facebook", href: "https://facebook.com" },
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "X", href: "https://x.com" },
];

// Short description reused in the navbar area, footer and metadata
export const siteDescription =
  "SocialBridge is a community-driven platform that connects compassionate people with meaningful charity events and volunteering opportunities across Bangladesh.";

// Footer navigation
export const quickLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Upcoming Events", href: "/upcoming-event" },
  { label: "About Us", href: "#mission" },
  { label: "Contact", href: "#contact" },
];

export const communityLinks: NavLink[] = [
  { label: "Become a Volunteer", href: "/register" },
  { label: "Organize an Event", href: "/create-event" },
  { label: "Browse Events", href: "/upcoming-event" },
  { label: "Volunteer Stories", href: "#testimonials" },
];