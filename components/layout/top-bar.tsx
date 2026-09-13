"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/context/settings-context";

export function TopBar() {
  const router = useRouter();
  const { profile } = useSettings();
  const [query, setQuery] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = query.trim();
    router.push(next ? `/stories?q=${encodeURIComponent(next)}` : "/stories");
  }

  return (
    <header className="hidden items-center justify-between gap-4 border-b border-border px-6 py-3 md:flex">
      <Link href="/" className="font-serif text-2xl tracking-tight md:hidden">
        Vesper
      </Link>
      <form onSubmit={onSubmit} className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-subtle" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search your stories"
          className="pl-11"
          aria-label="Search stories"
        />
      </form>
      <Link href="/profile" className="flex items-center gap-3 rounded-full py-1 pr-2 pl-1 hover:bg-elevated">
        <Avatar name={profile.displayName} hue={28} size="sm" />
        <span className="text-sm">{profile.displayName}</span>
      </Link>
    </header>
  );
}
