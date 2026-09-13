"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, Compass, Plus, Settings, PanelLeft } from "lucide-react";
import { FavoriteDiscussions } from "@/components/layout/favorite-discussions";
import { Button } from "@/components/ui/button";
import { useUI } from "@/context/ui-context";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/new", label: "New Story", icon: Plus },
  { href: "/stories", label: "My Stories", icon: BookMarked },
  { href: "/", label: "Discover", icon: Compass },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, setMobileNavOpen } = useUI();

  return (
    <aside
      className={cn(
        "hidden h-full flex-col border-r border-border bg-card/70 md:flex",
        sidebarCollapsed ? "w-[4.5rem]" : "w-64",
      )}
    >
      <div className="flex items-center justify-between px-3 py-4">
        {!sidebarCollapsed ? (
          <Link href="/" className="px-2 font-serif text-2xl tracking-tight">
            Vesper
          </Link>
        ) : (
          <span className="sr-only">Vesper</span>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Collapse sidebar">
          <PanelLeft className="size-4" />
        </Button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileNavOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
                active ? "bg-accent-soft text-foreground" : "text-muted hover:bg-elevated hover:text-foreground",
                sidebarCollapsed && "justify-center px-0",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {!sidebarCollapsed ? <span>{item.label}</span> : <span className="sr-only">{item.label}</span>}
            </Link>
          );
        })}
        <FavoriteDiscussions
          collapsed={sidebarCollapsed}
          onNavigate={() => setMobileNavOpen(false)}
        />
      </nav>
      <div className="px-3 pb-4">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted hover:bg-elevated hover:text-foreground",
            sidebarCollapsed && "justify-center px-0",
          )}
        >
          <Settings className="size-4" />
          {!sidebarCollapsed ? <span>Settings</span> : <span className="sr-only">Settings</span>}
        </Link>
      </div>
    </aside>
  );
}
