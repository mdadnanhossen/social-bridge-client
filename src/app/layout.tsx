
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";
import Footer from "@/components/layout/Footer";
import SiteNavbar from "@/components/layout/SiteNavbar";
import { siteDescription } from "@/data/home";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SocialBridge — Together, We Can Make a Difference",
  description: siteDescription,
  keywords: [
    "volunteering",
    "charity",
    "community service",
    "donations",
    "Bangladesh",
    "social development",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body className="flex min-h-full flex-col">
        <SiteNavbar />

        <main className="flex-1">{children}</main>

        <Toaster position="top-right" richColors closeButton />

        <Footer />
      </body>
    </html>
  );
}
