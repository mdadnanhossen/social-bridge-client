import Link from "next/link";
import type { ComponentType } from "react";
import { cacheLife } from "next/cache";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
} from "@/components/shared/SocialIcons";
import {
  communityLinks,
  contactInfo,
  quickLinks,
  siteDescription,
  socialLinks,
} from "@/data/home";
import type { SocialLink } from "@/types";

/** Map social network names to their inline brand icons. */
const socialIcons: Record<SocialLink["label"], ComponentType<{ className?: string }>> = {
  Facebook: FacebookIcon,
  Instagram: InstagramIcon,
  LinkedIn: LinkedInIcon,
  X: XIcon,
};

const contactItems = [
  { icon: MapPin, value: contactInfo.address, href: null },
  { icon: Phone, value: contactInfo.phone, href: `tel:${contactInfo.phone}` },
  { icon: Mail, value: contactInfo.email, href: `mailto:${contactInfo.email}` },
];

export default async function Footer() {
  "use cache";
  // Cached so the year is computed when this entry is filled and revalidated
  // (daily), never during the prerender — `new Date()` is unstable there.
  cacheLife("days");

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] text-slate-300 dark:bg-[#080f1d] dark:text-slate-300">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo tone="light" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              {siteDescription}
            </p>

            {/* Social media */}
            <ul className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = socialIcons[social.label];

                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`SocialBridge on ${social.label}`}
                      className="grid size-10 place-items-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-warm-500 hover:text-white"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick links */}
          <nav aria-labelledby="footer-quick-links">
            <h3
              id="footer-quick-links"
              className="font-heading text-sm font-semibold tracking-wide text-white uppercase"
            >
              Quick Links
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-warm-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Community links */}
          <nav aria-labelledby="footer-community-links">
            <h3
              id="footer-community-links"
              className="font-heading text-sm font-semibold tracking-wide text-white uppercase"
            >
              Community
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {communityLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-warm-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-sm font-semibold tracking-wide text-white uppercase">
              Contact
            </h3>
            <ul className="mt-5 space-y-4 text-sm">
              {contactItems.map((item) => {
                const Icon = item.icon;
                const content = (
                  <span className="flex items-start gap-3">
                    <Icon
                      className="mt-0.5 size-4 shrink-0 text-warm-500"
                      aria-hidden="true"
                    />
                    <span className="transition-colors group-hover:text-warm-500">
                      {item.value}
                    </span>
                  </span>
                );

                return (
                  <li key={item.value}>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="group inline-flex text-sm transition-colors hover:text-warm-500"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm sm:flex-row sm:px-6 lg:px-8">
          <p>
            &copy; {currentYear} SocialBridge. All rights reserved.
          </p>
          <p className="text-white/50">
            Made with care for communities in need.
          </p>
        </div>
      </div>
    </footer>
  );
}


