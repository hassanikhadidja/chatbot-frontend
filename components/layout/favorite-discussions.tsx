"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useStories } from "@/context/stories-context";
import { cn } from "@/lib/utils";

export function FavoriteDiscussions({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { stories } = useStories();
  const favorites = stories.filter((story) => story.favorited);

  if (favorites.length === 0) {
    return null;
  }

  return (
    <div className={cn("min-h-0 flex-1", collapsed && "flex flex-col items-center")}>
      {!collapsed ? (
        <p className="pt-5 pb-2 text-xs tracking-[0.16em] text-subtle uppercase">
          Discussions
        </p>
      ) : (
        <p className="sr-only">Discussions</p>
      )}
      <ul className="space-y-1 overflow-y-auto pb-2 story-scroll">
        {favorites.map((story) => {
          const href = `/story/${story.id}`;
          const active = pathname === href;
          return (
            <li key={story.id}>
              <Link
                href={href}
                onClick={onNavigate}
                title={story.setup.title}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition",
                  active ? "bg-accent-soft text-foreground" : "text-muted hover:bg-elevated hover:text-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                <MessageCircle className="size-4 shrink-0" />
                {!collapsed ? (
                  <span className="min-w-0 truncate">{story.setup.title}</span>
                ) : (
                  <span className="sr-only">{story.setup.title}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
