"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStory = pathname.startsWith("/story/");
  const isNew = pathname === "/new";

  return (
    <div className="flex h-dvh flex-col bg-background">
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          {!isStory ? <TopBar /> : null}
          {!isStory ? <MobileHeader /> : null}
          <main
            className={cn(
              "min-h-0 flex-1 overflow-y-auto story-scroll",
              (isStory || isNew) && "overflow-hidden",
              !isStory && !isNew && "pb-20 md:pb-0",
            )}
          >
            {children}
          </main>
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
}
