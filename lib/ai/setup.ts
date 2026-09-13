import { hueFromName } from "@/lib/ai/covers";
import type { StoryBrief, StoryCharacter, StorySetup } from "@/lib/types";

export function preferText(...values: unknown[]) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
}

function withBriefCharacter(
  character: StoryCharacter,
  name: string,
  role: string,
  appearance: string,
  behavior: string,
  hueOffset = 0,
): StoryCharacter {
  return {
    ...character,
    name,
    role: preferText(role, character.role),
    bio: preferText(character.bio, behavior),
    appearance: preferText(appearance, character.appearance),
    behavior: preferText(behavior, character.behavior),
    avatarHue: hueFromName(name, hueOffset),
  };
}

export function applyBriefToSetup(setup: StorySetup, brief: StoryBrief): StorySetup {
  const hisName = preferText(brief.hisName, setup.aiCharacter.name);
  const myName = preferText(brief.myName, setup.userRole.name);

  return {
    ...setup,
    otherCharacters: preferText(brief.otherCharacters, setup.otherCharacters),
    aiCharacter: withBriefCharacter(
      setup.aiCharacter,
      hisName,
      brief.hisRole,
      brief.hisAppearance,
      brief.hisBehavior,
    ),
    userRole: withBriefCharacter(
      setup.userRole,
      myName,
      brief.myRole,
      brief.myAppearance,
      brief.myBehavior,
      80,
    ),
  };
}
