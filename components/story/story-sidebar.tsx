"use client";

import { Avatar } from "@/components/ui/avatar";
import { getActivePlaythrough } from "@/lib/api/stories";
import type { Story } from "@/lib/types";

export function StorySidebar({
  story,
  framed = true,
}: {
  story: Story;
  framed?: boolean;
}) {
  const playthrough = getActivePlaythrough(story);

  return (
    <aside
      className={
        framed
          ? "hidden h-full w-64 shrink-0 flex-col border-r border-border bg-card/60 xl:flex"
          : "flex h-full flex-col"
      }
    >
      <div className="p-5">
        <p className="text-xs tracking-[0.18em] text-subtle uppercase">Inside the story</p>
        <h2 className="mt-2 font-serif text-2xl">{story.setup.title}</h2>
      </div>
      <div className="flex-1 space-y-8 overflow-y-auto px-5 pb-6 story-scroll">
        <section>
          <p className="mb-3 text-xs tracking-[0.16em] text-subtle uppercase">Chapters</p>
          <ol className="space-y-3">
            {playthrough.chapters.map((chapter, index) => (
              <li key={chapter.id}>
                <p className="text-sm font-medium">
                  {index + 1}. {chapter.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">{chapter.summary}</p>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <p className="mb-3 text-xs tracking-[0.16em] text-subtle uppercase">Characters</p>
          <div className="space-y-3">
            {[story.setup.aiCharacter, story.setup.userRole].map((character) => (
              <div key={character.name} className="flex items-center gap-3">
                <Avatar name={character.name} hue={character.avatarHue} size="sm" />
                <div>
                  <p className="text-sm">{character.name}</p>
                  <p className="text-xs text-subtle">{character.role}</p>
                </div>
              </div>
            ))}
            {story.setup.otherCharacters ? (
              <p className="text-xs leading-5 text-subtle">{story.setup.otherCharacters}</p>
            ) : null}
          </div>
        </section>
        <section>
          <p className="mb-3 text-xs tracking-[0.16em] text-subtle uppercase">Memory</p>
          <ul className="space-y-2">
            {playthrough.memories.map((memory) => (
              <li key={memory.id} className="text-sm leading-6 text-muted">
                {memory.text}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}
