"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StoryGrid } from "@/components/story/story-grid";
import { useStoryActions } from "@/components/story/story-actions";
import { useSettings } from "@/context/settings-context";
import { useStories } from "@/context/stories-context";
import { formatFullDate, pluralize } from "@/lib/utils";

export default function ProfilePage() {
  const { profile } = useSettings();
  const { stories } = useStories();
  const actions = useStoryActions();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <section className="flex flex-col items-start gap-5 rounded-[2rem] border border-border bg-card p-6 md:flex-row md:items-center">
        <Avatar name={profile.displayName} hue={28} size="xl" />
        <div className="flex-1">
          <h1 className="font-serif text-4xl">{profile.displayName}</h1>
          <p className="mt-1 text-muted">@{profile.username}</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{profile.bio}</p>
          <p className="mt-4 text-sm text-subtle">
            {pluralize(stories.length, "story", "stories")} · Joined {formatFullDate(profile.joinedAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/stories">My Stories</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/settings">Settings</Link>
          </Button>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-3xl">Stories created</h2>
        <p className="mt-2 mb-6 text-sm text-muted">Worlds that began with you.</p>
        {stories.length === 0 ? (
          <EmptyState
            title="No stories yet."
            description="Create a story and it will show up here."
            action={
              <Button asChild>
                <Link href="/new">Start a Story</Link>
              </Button>
            }
          />
        ) : (
          <StoryGrid
            stories={stories}
            layout="grid"
            onContinue={actions.continueStory}
            onRestart={actions.restart}
            onRename={actions.rename}
            onInfo={actions.info}
            onFavorite={actions.favorite}
            onDelete={actions.remove}
          />
        )}
      </section>
      {actions.dialogs}
    </div>
  );
}
