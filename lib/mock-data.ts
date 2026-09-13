import type { Story, StorySetup } from "@/lib/types";


export const STORY_PROMPTS = [
  "I want a dark romance with a mysterious billionaire.",
  "Put me in a fantasy kingdom where I’m the lost heir.",
  "I want a psychological thriller.",
  "Surprise me.",
] as const;

const SETUP_LIBRARY: Array<{ keywords: string[]; setup: StorySetup }> = [
  {
    keywords: ["romance", "billionaire", "dark"],
    setup: {
      title: "The Quiet Offer",
      bio: "A stranger with too much money and too little past offers you a contract that reads like a confession.",
      genres: ["Romance", "Drama"],
      setting: "A private penthouse above a sleepless city",
      coverImage:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
      coverTone: "from-neutral-950 via-stone-900 to-amber-950",
      aiCharacter: {
        name: "Julian Hart",
        role: "Reclusive financier",
        bio: "Wealthy, precise, and carefully unfinished in every public record.",
        avatarHue: 28,
      },
      userRole: {
        name: "You",
        role: "The one who said yes",
        bio: "Someone who arrived for work and stayed for the question underneath it.",
        avatarHue: 215,
      },
      openingScene:
        "The elevator opened on silence. No staff. No music. Only a long room of glass and a man who had already poured two drinks, as if your answer had been decided downstairs.",
    },
  },
  {
    keywords: ["fantasy", "kingdom", "heir", "prince"],
    setup: {
      title: "A Crown in Waiting",
      bio: "The court has been ruling in your absence. Tonight the blood-right returns, and so do the knives.",
      genres: ["Fantasy", "Adventure"],
      setting: "The winter court of Ilvaren",
      coverImage:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
      coverTone: "from-slate-950 via-indigo-950 to-stone-900",
      aiCharacter: {
        name: "Lord Soren",
        role: "Keeper of the winter court",
        bio: "A strategist who protected the throne by nearly becoming it.",
        avatarHue: 250,
      },
      userRole: {
        name: "The Returned Heir",
        role: "Claimant to Ilvaren",
        bio: "Raised among ordinary winters, carrying a name the banners still remember.",
        avatarHue: 40,
      },
      openingScene:
        "Snow collected on the banners as if even the weather wished to soften the announcement. The great doors opened. Every conversation died in the same breath.",
    },
  },
  {
    keywords: ["thriller", "psychological", "mind"],
    setup: {
      title: "The Reliable Witness",
      bio: "You are the only person who saw the crime. The problem is that your memory keeps editing itself.",
      genres: ["Thriller", "Mystery"],
      setting: "A coastal town that wants the case closed",
      coverImage:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
      coverTone: "from-zinc-950 via-slate-900 to-teal-950",
      aiCharacter: {
        name: "Inspector Hale",
        role: "Lead investigator",
        bio: "Patient, unreadable, and uncomfortably interested in the gaps in your story.",
        avatarHue: 200,
      },
      userRole: {
        name: "The Witness",
        role: "The one who cannot stop remembering",
        bio: "A visitor whose testimony changes every time it is spoken aloud.",
        avatarHue: 12,
      },
      openingScene:
        "The interview room smelled of paper and salt. Hale set a recorder between you and did not start it. “Tell me again,” he said. “This time, leave out the part you invented to stay kind.”",
    },
  },
];

const SURPRISE_SETUP: StorySetup = {
  title: "Letters from a Closed Season",
  bio: "A seaside hotel at the end of the year. One guest who should have checked out. One story that refuses to end at the lobby.",
  genres: ["Mystery", "Drama"],
  setting: "A shuttered grand hotel on the Atlantic",
  coverImage:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
  coverTone: "from-stone-950 via-amber-950 to-zinc-900",
  aiCharacter: {
    name: "Ivy Moreau",
    role: "The last concierge",
    bio: "She keeps the keys, the ledgers, and a version of events that almost fits.",
    avatarHue: 15,
  },
  userRole: {
    name: "You",
    role: "The off-season guest",
    bio: "You booked one night and woke up on a date the calendar does not have.",
    avatarHue: 265,
  },
  openingScene:
    "The lobby clock had stopped at a civil hour. Dust did not dare the piano. Ivy Moreau stood behind the desk with a key already in her hand, as if she had been practicing this greeting for a very long time.",
};

export function setupFromPrompt(prompt: string): StorySetup {
  const lower = prompt.toLowerCase();
  if (!prompt.trim() || lower.includes("surprise")) {
    return structuredClone(SURPRISE_SETUP);
  }

  const match = SETUP_LIBRARY.find((entry) =>
    entry.keywords.some((keyword) => lower.includes(keyword)),
  );

  if (match) {
    return structuredClone(match.setup);
  }

  return {
    title: "A Story Without a Map",
    bio: prompt.trim().slice(0, 160),
    genres: ["Drama"],
    setting: "A place that answers to the first sentence you gave it",
    coverImage:
      "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80",
    coverTone: "from-zinc-950 via-neutral-900 to-stone-800",
    aiCharacter: {
      name: "The Narrator",
      role: "Guide and counterpart",
      bio: "A presence that shapes the world around your choices.",
      avatarHue: 48,
    },
    userRole: {
      name: "You",
      role: "The one who begins",
      bio: "The first voice in a story that did not exist until now.",
      avatarHue: 220,
    },
    openingScene: `The world arranged itself around your words: “${prompt.trim()}”\n\nAir, light, and consequence arrived a moment later, waiting to see what you would do with them.`,
  };
}

export function openingFromSetup(setup: StorySetup): string {
  return `${setup.openingScene}\n\n${setup.aiCharacter.name} regarded you with the particular attention of someone who already knew the first page.\n\n“Shall we begin?”`;
}

export function replyFromUserMessage(story: Story, userText: string): string {
  const name = story.setup.aiCharacter.name;
  const trimmed = userText.trim();
  const action = trimmed.startsWith("*") || /^(i |i'|you )/i.test(trimmed);

  if (action) {
    return `${name} answered the movement before the words, as if the room itself had leaned closer.\n\n“I see.” A pause, measured. “Then we continue from here — and we do not pretend the last choice was small.”\n\nThe scene held. Something in the air waited for your next step.`;
  }

  return `${name} let the silence sit between you long enough to become part of the sentence.\n\n“${echoLine(trimmed)}”\n\nBeyond that, the world shifted a degree — not enough to name, enough to feel. The next move is yours.`;
}

function echoLine(text: string) {
  const clean = text.replace(/^["“]|["”]$/g, "").slice(0, 90);
  if (clean.length < 12) {
    return "Say that again, and mean it.";
  }
  return `You speak as if the world is obliged to listen. It might.`;
}

export function continueScene(story: Story): string {
  const { name } = story.setup.aiCharacter;
  return `Time loosened. The room — or the road, or the dark — made a little more room for what had not been said.\n\n${name} did not fill it cheaply.\n\n“There is more,” they said. “There always is. Stay with me a little longer.”`;
}

export function regenerateScene(story: Story): string {
  const { name } = story.setup.aiCharacter;
  return `${name} turned the moment over, as if choosing a kinder or crueller cut of the same truth.\n\n“Let me say it another way.”\n\nThe light changed. The meaning did not. You were still here, and the story still wanted you.`;
}
