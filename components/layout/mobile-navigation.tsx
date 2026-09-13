"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, Compass, Plus, Settings, UserRound } from "lucide-react";
import { FavoriteDiscussions } from "@/components/layout/favorite-discussions";
import { Drawer } from "@/components/ui/drawer";
import { useUI } from "@/context/ui-context";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/stories", label: "Stories", icon: BookMarked },
  { href: "/new", label: "New", icon: Plus },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const { mobileNavOpen, setMobileNavOpen } = useUI();
  const hideBar = pathname.startsWith("/story/");

  return (
    <>
      <Drawer open={mobileNavOpen} onOpenChange={setMobileNavOpen} title="Navigate" side="left">
        <nav className="flex flex-col gap-1 p-3">
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm hover:bg-elevated"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
          <FavoriteDiscussions onNavigate={() => setMobileNavOpen(false)} />
        </nav>
      </Drawer>
      {!hideBar ? (
        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background/95 px-2 py-2 backdrop-blur md:hidden">
          {ITEMS.filter((item) => item.href !== "/settings").map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px]",
                  active ? "text-foreground" : "text-subtle",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </>
  );
}
