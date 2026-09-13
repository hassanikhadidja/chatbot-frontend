"use client";

import { StoryCard } from "@/components/story/story-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Story, ViewMode } from "@/lib/types";

export function StoryGrid({
  stories,
  layout,
  loading,
  onContinue,
  onRestart,
  onRename,
  onInfo,
  onFavorite,
  onDelete,
}: {
  stories: Story[];
  layout: ViewMode;
  loading?: boolean;
  onContinue: (story: Story) => void;
  onRestart: (story: Story) => void;
  onRename: (story: Story) => void;
  onInfo: (story: Story) => void;
  onFavorite: (story: Story) => void;
  onDelete: (story: Story) => void;
}) {
  if (loading) {
    return (
      <div className={layout === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-3"}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className={layout === "grid" ? "h-96" : "h-32"} />
        ))}
      </div>
    );
  }

  return (
    <div className={layout === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-3"}>
      {stories.map((story) => (
        <StoryCard
          key={story.id}
          story={story}
          layout={layout}
          onContinue={() => onContinue(story)}
          onRestart={() => onRestart(story)}
          onRename={() => onRename(story)}
          onInfo={() => onInfo(story)}
          onFavorite={() => onFavorite(story)}
          onDelete={() => onDelete(story)}
        />
      ))}
    </div>
  );
}
