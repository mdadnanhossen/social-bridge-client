
"use client";

import { Suspense } from "react";
import Navbar, { NavbarFallback } from "@/components/layout/Navbar";
import { navLinks } from "@/data/home";

export default function SiteNavbar() {
  return (
    <Suspense fallback={<NavbarFallback />}>
      <Navbar links={navLinks} />
    </Suspense>
  );
}
