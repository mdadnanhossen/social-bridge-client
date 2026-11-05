"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * App-wide theme provider.
 *
 * next-themes renders a small inline script as the first child of the
 * provider, so the saved (or system) theme is applied to <html> while the
 * HTML is still parsing — before the first paint, with no light/dark flash.
 * It also keeps every consumer (navbar toggle, toaster, charts) in sync and
 * reacts to OS preference changes and updates from other browser tabs.
 *
 * - `attribute="class"` toggles the `.dark` class that globals.css keys off
 * - `defaultTheme="system"` follows the OS until the user picks a theme
 * - `disableTransitionOnChange` avoids a full-page color animation on toggle
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
