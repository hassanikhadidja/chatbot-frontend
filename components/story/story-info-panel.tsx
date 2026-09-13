"use client";

import { StoryCharacter } from "@/components/story/story-character";
import { StoryCover } from "@/components/story/story-cover";
import { PlaythroughList } from "@/components/story/playthrough-list";
import { Badge } from "@/components/ui/badge";
import { getActivePlaythrough } from "@/lib/api/stories";
import type { Story } from "@/lib/types";
import { formatFullDate } from "@/lib/utils";

export function StoryInfoPanel({
  story,
  onSelectPlaythrough,
}: {
  story: Story;
  onSelectPlaythrough: (id: string) => void;
}) {
  const playthrough = getActivePlaythrough(story);

  return (
    <div className="space-y-8 p-5">
      <div className="overflow-hidden rounded-3xl">
        <StoryCover setup={story.setup} className="aspect-4/5" sizes="360px" />
      </div>
      <div>
        <h2 className="font-serif text-3xl leading-tight">{story.setup.title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{story.setup.bio}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {story.setup.genres.map((genre) => (
            <Badge key={genre}>{genre}</Badge>
          ))}
        </div>
      </div>
      <StoryCharacter label="AI Character" character={story.setup.aiCharacter} />
      <StoryCharacter label="Your Role" character={story.setup.userRole} />
      {story.setup.otherCharacters ? (
        <section>
          <p className="text-xs tracking-[0.16em] text-subtle uppercase">Other characters</p>
          <p className="mt-2 text-sm leading-6 text-muted">{story.setup.otherCharacters}</p>
        </section>
      ) : null}
      <section>
        <p className="text-xs tracking-[0.16em] text-subtle uppercase">Setting</p>
        <p className="mt-2 text-sm">{story.setup.setting}</p>
      </section>
      <section className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs tracking-[0.16em] text-subtle uppercase">Created</p>
          <p className="mt-2">{formatFullDate(story.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs tracking-[0.16em] text-subtle uppercase">Last played</p>
          <p className="mt-2">{formatFullDate(story.lastPlayedAt)}</p>
        </div>
      </section>
      <section>
        <p className="text-xs tracking-[0.16em] text-subtle uppercase">Playthroughs</p>
        <p className="mt-2 mb-3 text-sm text-muted">
          Viewing playthrough #{playthrough.number}. Older runs stay intact.
        </p>
        <PlaythroughList
          playthroughs={story.playthroughs}
          activeId={story.activePlaythroughId}
          onSelect={onSelectPlaythrough}
        />
      </section>
    </div>
  );
}
