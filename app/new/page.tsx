"use client";

import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStories } from "@/context/stories-context";
import type { StoryBrief } from "@/lib/types";

const EMPTY_BRIEF: StoryBrief = {
  story: "",
  hisName: "",
  hisRole: "",
  hisAppearance: "",
  hisBehavior: "",
  myName: "",
  myRole: "",
  myAppearance: "",
  myBehavior: "",
  otherCharacters: "",
};

const EXAMPLES: Array<{ label: string; brief: StoryBrief }> = [
  {
    label: "Dark romance",
    brief: {
      hisName: "Adrian Vale",
      hisRole: "A closed-off billionaire who already knows too much",
      hisAppearance: "Late thirties, black coat, pale eyes, a scar at the mouth. Tall, still, expensive.",
      hisBehavior: "Calm, possessive, rarely explains himself. Speaks softly. Watches before he touches.",
      myName: "Elena Voss",
      myRole: "A detective who walked into the wrong private club",
      myAppearance: "Dark hair in a knot, rain on a wool coat, a badge she should not have brought.",
      myBehavior: "Sharp, stubborn, does not back down. I write my own moves and lines.",
      otherCharacters: "His driver, Marek",
      story:
        "Rainy London. I find him waiting in a glass-walled lounge as if he booked this hour years ago. He wants me to stay the night. I came for answers.",
    },
  },
  {
    label: "Fantasy heir",
    brief: {
      hisName: "Prince Kael",
      hisRole: "Regent who ruled in my absence",
      hisAppearance: "Gold thread at the collar, travel dust on black armor, tired green eyes.",
      hisBehavior: "Loyal, jealous of the court, careful with his hands. He never writes my choices.",
      myName: "The lost heir",
      myRole: "The rightful blood returned after twelve years",
      myAppearance: "Road-worn cloak, a crown hidden in a satchel, the same mouth as the old banners.",
      myBehavior: "Proud, wary, I decide what I say and do.",
      otherCharacters: "The council",
      story:
        "I ride into Caer Vareth at dusk. The bell that has not rung in twelve years starts to sound. He meets me in the courtyard before the guards can announce me.",
    },
  },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs tracking-[0.16em] text-subtle uppercase">{label}</span>
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export default function NewStoryPage() {
  return (
    <Suspense>
      <NewStoryView />
    </Suspense>
  );
}

function NewStoryView() {
  const router = useRouter();
  const { createStoryFromPrompt } = useStories();
  const [brief, setBrief] = useState<StoryBrief>(EMPTY_BRIEF);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(next: Partial<StoryBrief>) {
    setBrief((current) => ({ ...current, ...next }));
  }

  async function begin() {
    if (!brief.story.trim() || !brief.hisName.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const story = await createStoryFromPrompt({
        ...brief,
        myName: brief.myName.trim() || "You",
      });
      router.push(`/story/${story.id}`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mx-auto min-h-0 w-full max-w-2xl flex-1 overflow-y-auto px-4 py-6 md:py-10 story-scroll">
      <p className="text-xs tracking-[0.2em] text-subtle uppercase">New discussion</p>
      <h1 className="mt-3 font-serif text-3xl leading-tight md:text-5xl">
        Set the cast. He starts. You answer.
      </h1>
      <p className="mt-4 text-base leading-7 text-muted">
        Give him his name, look, role, and behavior — then yours, then the story. He opens in his point of view. You write yours.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example.label}
            type="button"
            disabled={busy}
            onClick={() => setBrief(example.brief)}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-muted hover:border-accent/30 hover:text-foreground"
          >
            Use {example.label}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-8">
        <section className="space-y-4 rounded-[1.6rem] border border-border bg-card p-4 md:p-5">
          <h2 className="font-serif text-2xl">Him</h2>
          <p className="text-sm text-muted">The AI plays this person, first person.</p>
          <Field label="His name">
            <Input
              value={brief.hisName}
              onChange={(event) => patch({ hisName: event.target.value })}
              placeholder="Adrian Vale"
            />
          </Field>
          <Field label="His role">
            <Input
              value={brief.hisRole}
              onChange={(event) => patch({ hisRole: event.target.value })}
              placeholder="The man behind the glass, your rival, your husband…"
            />
          </Field>
          <Field label="His appearance" hint="Face, body, clothes, age. He will keep this look.">
            <Textarea
              value={brief.hisAppearance}
              onChange={(event) => patch({ hisAppearance: event.target.value })}
              placeholder="Black hair, pale eyes, a scar at the mouth, tall in a dark coat…"
            />
          </Field>
          <Field label="His behavior" hint="How he talks, what he wants, what he never does.">
            <Textarea
              value={brief.hisBehavior}
              onChange={(event) => patch({ hisBehavior: event.target.value })}
              placeholder="Quiet, intense, never writes my lines. He reacts to me."
            />
          </Field>
        </section>

        <section className="space-y-4 rounded-[1.6rem] border border-border bg-card p-4 md:p-5">
          <h2 className="font-serif text-2xl">You</h2>
          <p className="text-sm text-muted">You play this person. He will not write your turn.</p>
          <Field label="Your name">
            <Input
              value={brief.myName}
              onChange={(event) => patch({ myName: event.target.value })}
              placeholder="Elena"
            />
          </Field>
          <Field label="Your role">
            <Input
              value={brief.myRole}
              onChange={(event) => patch({ myRole: event.target.value })}
              placeholder="Detective, lost heir, the one who said yes…"
            />
          </Field>
          <Field label="Your appearance" hint="How he should see you.">
            <Textarea
              value={brief.myAppearance}
              onChange={(event) => patch({ myAppearance: event.target.value })}
              placeholder="Dark hair, rain on a wool coat, a tired mouth…"
            />
          </Field>
          <Field label="Your behavior">
            <Textarea
              value={brief.myBehavior}
              onChange={(event) => patch({ myBehavior: event.target.value })}
              placeholder="I decide what I say and do. Stubborn. I don’t wait for permission."
            />
          </Field>
        </section>

        <section className="space-y-4 rounded-[1.6rem] border border-border bg-card p-4 md:p-5">
          <h2 className="font-serif text-2xl">The story</h2>
          <Field label="Other characters" hint="Optional. Names only, or names and a line each.">
            <Input
              value={brief.otherCharacters}
              onChange={(event) => patch({ otherCharacters: event.target.value })}
              placeholder="Marek the driver, Lady Soren…"
            />
          </Field>
          <Field label="Story" hint="Where you are, what just happened, what he wants.">
            <Textarea
              className="min-h-36"
              value={brief.story}
              onChange={(event) => patch({ story: event.target.value })}
              placeholder="Start us in the room. Tell him the situation. He will open from his eyes."
            />
          </Field>
        </section>
      </div>

      {busy ? (
        <div className="mt-8">
          <Badge>He is opening the scene</Badge>
          <div className="mt-4">
            <TypingIndicator name={brief.hisName || "He"} />
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-8 rounded-2xl border border-border px-4 py-4">
          <p>{error}</p>
          <Button className="mt-3" onClick={() => void begin()}>
            Try again
          </Button>
        </div>
      ) : null}
      </div>

      <div className="shrink-0 border-t border-border bg-background/95 px-4 pt-3 pb-[5.5rem] backdrop-blur-md md:pb-4">
        <div className="mx-auto w-full max-w-2xl">
          <Button
            size="lg"
            className="w-full"
            disabled={busy || !brief.hisName.trim() || !brief.story.trim()}
            onClick={() => void begin()}
          >
            Start — he writes first
          </Button>
          <p className="mt-2 pb-1 text-center text-xs text-subtle">
            His name and the story are required. Then he begins. You answer as you.
          </p>
        </div>
      </div>
    </div>
  );
}
