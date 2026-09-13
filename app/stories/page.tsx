"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { StoryGrid } from "@/components/story/story-grid";
import { useStoryActions } from "@/components/story/story-actions";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useStories } from "@/context/stories-context";
import { ALL_GENRES, type StorySort, type ViewMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function StoriesPage() {
  return (
    <Suspense>
      <StoriesView />
    </Suspense>
  );
}

function StoriesView() {
  const searchParams = useSearchParams();
  const { stories, error, hydrate } = useStories();
  const actions = useStoryActions();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState<StorySort>("lastPlayed");
  const [layout, setLayout] = useState<ViewMode>("grid");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return stories
      .filter((story) => {
        const haystack = [
          story.setup.title,
          story.setup.bio,
          story.setup.aiCharacter.name,
          story.setup.userRole.name,
          story.setup.otherCharacters ?? "",
          ...story.setup.genres,
        ]
          .join(" ")
          .toLowerCase();
        const matchesQuery = !needle || haystack.includes(needle);
        const matchesGenre = genre === "all" || story.setup.genres.includes(genre);
        return matchesQuery && matchesGenre;
      })
      .sort((a, b) => {
        if (sort === "title") return a.setup.title.localeCompare(b.setup.title);
        if (sort === "created") return +new Date(b.createdAt) - +new Date(a.createdAt);
        return +new Date(b.lastPlayedAt) - +new Date(a.lastPlayedAt);
      });
  }, [stories, query, genre, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <h1 className="font-serif text-4xl">My Stories</h1>
      <p className="mt-2 text-muted">Continue the worlds you’ve created.</p>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search titles, characters, genres"
          aria-label="Search stories"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
            className="h-11 rounded-full border border-border bg-elevated px-4 text-sm"
            aria-label="Filter by genre"
          >
            <option value="all">All genres</option>
            {ALL_GENRES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as StorySort)}
            className="h-11 rounded-full border border-border bg-elevated px-4 text-sm"
            aria-label="Sort stories"
          >
            <option value="lastPlayed">Last played</option>
            <option value="title">Title</option>
            <option value="created">Date created</option>
          </select>
          <div className="flex rounded-full border border-border p-1">
            <button
              type="button"
              onClick={() => setLayout("grid")}
              className={cn("rounded-full p-2", layout === "grid" && "bg-elevated")}
              aria-label="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setLayout("list")}
              className={cn("rounded-full p-2", layout === "list" && "bg-elevated")}
              aria-label="List view"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {error ? (
          <div className="rounded-3xl border border-border px-6 py-12 text-center">
            <p>Something went wrong.</p>
            <Button className="mt-4" onClick={hydrate}>
              Try again
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={stories.length === 0 ? "No stories yet." : "No matching stories."}
            description={
              stories.length === 0
                ? "Describe an idea, a character, or a world, and we will begin."
                : "Try another search or genre."
            }
            action={
              <Button asChild>
                <Link href="/new">Create your first story</Link>
              </Button>
            }
          />
        ) : (
          <StoryGrid
            stories={filtered}
            layout={layout}
            onContinue={actions.continueStory}
            onRestart={actions.restart}
            onRename={actions.rename}
            onInfo={actions.info}
            onFavorite={actions.favorite}
            onDelete={actions.remove}
          />
        )}
      </div>
      {actions.dialogs}
    </div>
  );
}
