"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Info, MoreHorizontal, RotateCcw } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import type { Story } from "@/lib/types";

export function StoryHeader({
  story,
  onInfo,
  onRestart,
  onRename,
  onFavorite,
  onDelete,
}: {
  story: Story;
  onInfo: () => void;
  onRestart: () => void;
  onRename: () => void;
  onFavorite: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();

  return (
    <header className="flex items-center gap-3 border-b border-border px-4 py-3">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Back to stories"
        className="md:hidden"
        onClick={() => router.push("/stories")}
      >
        <ChevronLeft className="size-5" />
      </Button>
      <Avatar name={story.setup.aiCharacter.name} hue={story.setup.aiCharacter.avatarHue} />
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-serif text-xl">{story.setup.title}</h1>
        <p className="truncate text-xs text-muted">
          {story.setup.aiCharacter.name} · {story.setup.genres.join(" · ")}
        </p>
      </div>
      <Button variant="ghost" size="icon" aria-label="Story information" onClick={onInfo}>
        <Info className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Restart story" onClick={onRestart}>
        <RotateCcw className="size-4" />
      </Button>
      <Dropdown
        trigger={
          <Button variant="ghost" size="icon" aria-label="More story actions">
            <MoreHorizontal className="size-4" />
          </Button>
        }
      >
        <DropdownItem onSelect={onInfo}>Continue</DropdownItem>
        <DropdownItem onSelect={onRestart}>Restart story</DropdownItem>
        <DropdownItem onSelect={onRename}>Rename</DropdownItem>
        <DropdownItem onSelect={onInfo}>Story information</DropdownItem>
        <DropdownItem onSelect={onFavorite}>
          {story.favorited ? "Remove from favoris" : "Favoris"}
        </DropdownItem>
        <DropdownItem danger onSelect={onDelete}>
          Delete story
        </DropdownItem>
      </Dropdown>
    </header>
  );
}
