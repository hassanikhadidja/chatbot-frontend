"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { StoryCover } from "@/components/story/story-cover";
import { getActivePlaythrough } from "@/lib/api/stories";
import type { Story } from "@/lib/types";
import { formatRelativeDate, pluralize } from "@/lib/utils";

export function StoryCard({
  story,
  layout = "grid",
  onContinue,
  onRestart,
  onRename,
  onInfo,
  onFavorite,
  onDelete,
}: {
  story: Story;
  layout?: "grid" | "list";
  onContinue: () => void;
  onRestart: () => void;
  onRename: () => void;
  onInfo: () => void;
  onFavorite: () => void;
  onDelete: () => void;
}) {
  const playthrough = getActivePlaythrough(story);
  const menu = (
    <Dropdown
      trigger={
        <Button variant="ghost" size="icon" aria-label="Story actions" className="size-9">
          <MoreHorizontal className="size-4" />
        </Button>
      }
    >
      <DropdownItem onSelect={onContinue}>Continue</DropdownItem>
      <DropdownItem onSelect={onRestart}>Restart</DropdownItem>
      <DropdownItem onSelect={onRename}>Rename</DropdownItem>
      <DropdownItem onSelect={onInfo}>Story information</DropdownItem>
      <DropdownItem onSelect={onFavorite}>
        {story.favorited ? "Remove from favoris" : "Favoris"}
      </DropdownItem>
      <DropdownItem danger onSelect={onDelete}>
        Delete
      </DropdownItem>
    </Dropdown>
  );

  if (layout === "list") {
    return (
      <article className="flex gap-4 rounded-3xl border border-border bg-card p-3 transition hover:border-accent/25">
        <Link href={`/story/${story.id}`} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl">
          <StoryCover setup={story.setup} className="absolute inset-0" sizes="96px" />
        </Link>
        <div className="min-w-0 flex-1 py-1">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/story/${story.id}`} className="min-w-0">
              <h3 className="font-serif text-xl leading-tight">{story.setup.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{story.setup.bio}</p>
            </Link>
            {menu}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-subtle">
            <span>{story.setup.aiCharacter.name}</span>
            <span>·</span>
            <span>{story.setup.genres.join(" · ")}</span>
            <span>·</span>
            <span>{formatRelativeDate(story.lastPlayedAt)}</span>
            <span>·</span>
            <span>{pluralize(playthrough.messages.length, "message")}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-accent/25">
      <Link href={`/story/${story.id}`} className="relative block aspect-4/5">
        <StoryCover setup={story.setup} className="absolute inset-0" sizes="(max-width: 768px) 100vw, 33vw" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-xs tracking-wide text-white/70 uppercase">
            {story.setup.aiCharacter.name}
          </p>
          <h3 className="mt-1 font-serif text-2xl text-white">{story.setup.title}</h3>
        </div>
      </Link>
      <div className="p-4">
        <p className="line-clamp-2 text-sm leading-6 text-muted">{story.setup.bio}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {story.setup.genres.map((genre) => (
            <Badge key={genre}>{genre}</Badge>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-xs text-subtle">
            {formatRelativeDate(story.lastPlayedAt)} · {pluralize(playthrough.messages.length, "message")}
          </p>
          <div className="flex items-center">
            <Button size="sm" onClick={onContinue}>
              Continue
            </Button>
            {menu}
          </div>
        </div>
      </div>
    </article>
  );
}
