"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  CalendarDays,
  CheckCircle2,
  ChevronUp,
  LogOut,
  Menu,
  Moon,
  PlusCircle,
  Settings,
  Sun,
} from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/shared/Logo";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface NavbarProps {
  /** Center links. Defaults to only "Upcoming Events". */
  links?: { label: string; href: string }[];
}

const DEFAULT_LINKS = [{ label: "Upcoming Events", href: "/upcoming-events" }];

/** Routes where repeating the "Login / Register" buttons would be redundant. */
const AUTH_PATHS = new Set(["/login", "/signup"]);

const MENU_ITEMS = [
  {
    label: "Create Event",
    href: "/create-event",
    icon: PlusCircle,
    iconClass: "text-emerald-500",
  },
  {
    label: "Manage Events",
    href: "/manage-events",
    icon: Settings,
    iconClass: "text-indigo-500",
  },
  {
    label: "Joined Events",
    href: "/joined-events",
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
  },
] as const;

const outlineAuthClass =
  "rounded-full border-brand-800/30 text-brand-800 hover:border-brand-800 hover:bg-brand-50 hover:text-brand-800";

const logoutBtnClass =
  "rounded-lg border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600";

/**
 * Static shell shown while the real navbar (which reads URL/session data)
 * streams in behind its Suspense boundary on dynamic routes.
 */
export function NavbarFallback() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <div aria-hidden="true" className="hidden gap-2 lg:flex">
          <span className="size-10 animate-pulse rounded-full bg-muted" />
          <span className="h-10 w-28 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </header>
  );
}

export function Navbar({ links = DEFAULT_LINKS }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  /** Path the account menu was opened on; null means the menu is closed. */
  const [dropdownPath, setDropdownPath] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the account menu when the route changes (this also covers browser
  // back/forward, which never passes through the menu's click handlers).
  if (dropdownPath !== null && dropdownPath !== pathname) {
    setDropdownPath(null);
  }

  const dropdownOpen = dropdownPath !== null;

  // Theme state is owned by next-themes: its inline script applies the saved
  // theme to <html> while the HTML parses (before first paint — no flash),
  // and this hook stays in sync with toggles, other tabs, and OS changes.
  const { resolvedTheme, setTheme } = useTheme();

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  // On the auth pages themselves, only show the buttons when signed out.
  const showAuthActions = Boolean(user) || !AUTH_PATHS.has(pathname);

  const firstName = user?.name?.split(" ")[0] ?? user?.email ?? "there";
  const initial = firstName.charAt(0).toUpperCase();

  // Close dropdown on outside click or Escape.
  useEffect(() => {
    if (!dropdownOpen) return;

    function onPointerDown(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownPath(null);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownPath(null);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [dropdownOpen]);

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  async function handleSignOut() {
    const { error } = await authClient.signOut();

    if (error) {
      toast.error("Could not sign out", {
        description: error.message || "Please try again.",
      });
      return;
    }

    setMenuOpen(false);
    setDropdownPath(null);
    toast.success("Signed out", { description: "See you again soon!" });
    router.push("/");
    router.refresh();
  }

  const themeButton = (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle light / dark theme"
      className="flex size-10 items-center justify-center rounded-full border bg-background text-indigo-600 shadow-sm transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-brand-800 focus-visible:outline-none dark:text-warm-500"
    >
      {/* Both icons render on the server and the client; the `.dark` class
          on <html> decides which one shows. The markup never differs between
          renders, so there is no hydration mismatch and the swap is instant. */}
      <Moon className="size-5 dark:hidden" aria-hidden="true" />
      <Sun className="size-5 hidden dark:block" aria-hidden="true" />
    </button>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop center navigation */}
        <nav aria-label="Main navigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50",
                    pathname === link.href && "bg-brand-50"
                  )}
                >
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 lg:flex">
          {themeButton}

          {isPending ? (
            <div
              aria-hidden="true"
              className="h-10 w-44 animate-pulse rounded-full bg-muted"
            />
          ) : user ? (
            <>
              {/* Avatar dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownPath(dropdownOpen ? null : pathname)}
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                  aria-label="Open account menu"
                  className="flex items-center gap-1.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-800"
                >
                  <Avatar className="size-11 shadow ring-2 ring-background">
                    {user.image ? (
                      <AvatarImage src={user.image} alt="" />
                    ) : null}
                    <AvatarFallback className="bg-brand-800 font-bold text-white">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronUp
                    className={cn(
                      "size-4 text-brand-800 transition-transform",
                      !dropdownOpen && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>

                {dropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-2xl border bg-popover shadow-xl ring-1 ring-black/5"
                  >
                    <div className="border-b px-5 py-4">
                      <p className="truncate font-semibold">
                        {user.name ?? firstName}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>

                    <div className="p-1.5">
                      {MENU_ITEMS.map(
                        ({ label, href, icon: Icon, iconClass }) => (
                          <Link
                            key={href}
                            href={href}
                            role="menuitem"
                            onClick={() => setDropdownPath(null)}
                            className="flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium transition hover:bg-muted"
                          >
                            <Icon
                              className={cn("size-5", iconClass)}
                              aria-hidden="true"
                            />
                            {label}
                          </Link>
                        )
                      )}
                    </div>

                    <div className="border-t p-1.5">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut className="size-5" aria-hidden="true" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                onClick={handleSignOut}
                className={logoutBtnClass}
              >
                <LogOut className="size-4" aria-hidden="true" />
                Logout
              </Button>
            </>
          ) : showAuthActions ? (
            <>
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "outline",
                  className: cn(outlineAuthClass, "px-5"),
                })}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({ className: "rounded-full px-5" })}
              >
                Register
              </Link>
            </>
          ) : null}
        </div>

        {/* Mobile: theme + menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          {themeButton}

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation menu"
                />
              }
            >
              <Menu className="size-5" aria-hidden="true" />
            </SheetTrigger>

            <SheetContent side="right" className="w-72 sm:max-w-xs">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>

              <nav
                aria-label="Mobile navigation"
                className="flex flex-1 flex-col gap-1 px-4"
              >
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50",
                      pathname === link.href && "bg-brand-50"
                    )}
                  >
                    <CalendarDays className="size-4" aria-hidden="true" />
                    {link.label}
                  </Link>
                ))}

                {user &&
                  MENU_ITEMS.map(({ label, href, icon: Icon, iconClass }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      <Icon
                        className={cn("size-4", iconClass)}
                        aria-hidden="true"
                      />
                      {label}
                    </Link>
                  ))}
              </nav>

              <div className="flex flex-col gap-2 px-4 pb-4">
                {isPending ? (
                  <div
                    aria-hidden="true"
                    className="h-9 w-full animate-pulse rounded-full bg-muted"
                  />
                ) : user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl bg-brand-50 px-3 py-2.5 transition hover:bg-brand-100"
                    >
                      <Avatar className="size-9">
                        {user.image ? (
                          <AvatarImage src={user.image} alt="" />
                        ) : null}
                        <AvatarFallback className="bg-brand-800 text-sm font-bold text-white">
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-brand-900">
                          {user.name ?? firstName}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </span>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={handleSignOut}
                      className={cn(logoutBtnClass, "w-full")}
                    >
                      <LogOut className="size-4" aria-hidden="true" />
                      Logout
                    </Button>
                  </>
                ) : showAuthActions ? (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className={buttonVariants({
                        variant: "outline",
                        className: cn(outlineAuthClass, "w-full"),
                      })}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMenuOpen(false)}
                      className={buttonVariants({
                        className: "w-full rounded-full",
                      })}
                    >
                      Register
                    </Link>
                  </>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default Navbar;