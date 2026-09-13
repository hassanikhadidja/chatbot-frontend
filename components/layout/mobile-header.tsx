"use client";

import Link from "next/link";
import { Menu, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUI } from "@/context/ui-context";

export function MobileHeader() {
  const { setMobileNavOpen } = useUI();

  return (
    <header className="flex items-center justify-between border-b border-border px-3 py-3 md:hidden">
      <Button variant="ghost" size="icon" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}>
        <Menu className="size-5" />
      </Button>
      <Link href="/" className="font-serif text-xl">
        Vesper
      </Link>
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild aria-label="Search stories">
          <Link href="/stories">
            <Search className="size-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild aria-label="Profile">
          <Link href="/profile">
            <UserRound className="size-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
