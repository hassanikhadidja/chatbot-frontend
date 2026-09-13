import { Avatar } from "@/components/ui/avatar";
import type { StoryCharacter } from "@/lib/types";

export function StoryCharacter({
  label,
  character,
}: {
  label: string;
  character: StoryCharacter;
}) {
  return (
    <section>
      <p className="text-xs tracking-[0.16em] text-subtle uppercase">{label}</p>
      <div className="mt-3 flex items-start gap-3">
        <Avatar name={character.name} hue={character.avatarHue} />
        <div>
          <h3 className="font-medium">{character.name}</h3>
          <p className="text-sm text-muted">{character.role}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">“{character.bio}”</p>
      {character.appearance ? (
        <p className="mt-2 text-sm leading-6 text-muted">Appearance: {character.appearance}</p>
      ) : null}
      {character.behavior ? (
        <p className="mt-2 text-sm leading-6 text-muted">Behavior: {character.behavior}</p>
      ) : null}
    </section>
  );
}
