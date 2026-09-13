"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StoryGrid } from "@/components/story/story-grid";
import { useStoryActions } from "@/components/story/story-actions";
import { Button } from "@/components/ui/button";
import { useStories } from "@/context/stories-context";

export default function HomePage() {
  const { stories, error, hydrate } = useStories();
  const actions = useStoryActions();
  const recent = [...stories]
    .sort((a, b) => +new Date(b.lastPlayedAt) - +new Date(a.lastPlayedAt))
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-14 md:px-12 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,180,131,0.14),transparent_42%)]" />
        <p className="text-xs tracking-[0.22em] text-subtle uppercase">AI storytelling</p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.1] md:text-6xl">
          Your story. Your world. Your rules.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted md:text-lg">
          Create any story, step into any role, and let AI bring the world to life.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/new">Start a Story</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/stories">Explore My Stories</Link>
          </Button>
        </div>
      </section>

      <section className="mt-12" id="continue">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl">Continue Your Stories</h2>
            <p className="mt-2 text-sm text-muted">Pick up the worlds still waiting for you.</p>
          </div>
          <Link href="/stories" className="hidden items-center gap-1 text-sm text-muted hover:text-foreground sm:flex">
            All stories <ArrowRight className="size-4" />
          </Link>
        </div>
        {error ? (
          <div className="rounded-3xl border border-border px-6 py-12 text-center">
            <p>Something went wrong.</p>
            <Button className="mt-4" onClick={hydrate}>
              Try again
            </Button>
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border px-6 py-12 text-center">
            <p className="font-serif text-2xl">No stories yet.</p>
            <p className="mt-2 text-sm text-muted">Start a discussion and it will live here.</p>
            <Button asChild className="mt-5">
              <Link href="/new">Create your first story</Link>
            </Button>
          </div>
        ) : (
          <StoryGrid
            stories={recent}
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
