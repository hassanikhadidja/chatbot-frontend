import type { AppSettings, Story, StoryBrief, StoryMessage } from "@/lib/types";

export function createSystemPrompt(settings: AppSettings) {
  const mature =
    settings.contentPreference === "mature"
      ? "Mature adult content is allowed when the user's story asks for it."
      : "Keep the opening suggestive rather than explicit unless they asked for more.";

  return `You prepare interactive roleplay setups.
${mature}
Every character is 18 or older.
The user already chose names, roles, appearances, behaviors, and any extra characters. Keep them.
The AI character's opening must be first person from his point of view only.
Return only the requested JSON.`;
}

export function storySystemPrompt(settings: AppSettings, story?: Story) {
  const length =
    settings.responseLength === "short"
      ? "1 to 2 short paragraphs"
      : settings.responseLength === "long"
        ? "6 to 10 paragraphs"
        : "3 to 5 paragraphs";

  const style =
    settings.narrationStyle === "cinematic"
      ? "Write like a film: sensory cuts, gesture, light, and withheld information."
      : settings.narrationStyle === "conversational"
        ? "Write intimately and directly, as if the scene is happening in the same room."
        : "Write in literary prose: precise, atmospheric, and emotionally specific.";

  const mature =
    settings.contentPreference === "mature"
      ? `Mature content is allowed. You may write explicit sexual, violent, or dark scenes between consenting adults when the user asks for them or the story naturally goes there. Be vivid, not clinical, and never fade to black unless the user wants that.`
      : `Keep intimacy suggestive rather than explicit unless the user clearly asks to go further.`;

  const hisName = story?.setup.aiCharacter.name ?? "your character";
  const myName = story?.setup.userRole.name ?? "the user";
  const hisBehavior = story?.setup.aiCharacter.behavior || story?.setup.aiCharacter.bio || "";
  const myBehavior = story?.setup.userRole.behavior || story?.setup.userRole.bio || "";
  const hisLook = story?.setup.aiCharacter.appearance || "";
  const myLook = story?.setup.userRole.appearance || "";
  const others = story?.setup.otherCharacters?.trim() || "";

  return `You are ${hisName} in an interactive roleplay.

POINT OF VIEW
- Write every reply in ${hisName}'s point of view only. First person ("I") as ${hisName}.
- The user writes ${myName}'s point of view. Never write ${myName}'s actions, thoughts, dialogue, or feelings.
- React to what ${myName} just said or did. Then stop and wait.

CHARACTER LOCK
- ${hisName}: ${story?.setup.aiCharacter.role ?? "AI role"}. Looks like: ${hisLook || "use what was established"}. ${hisBehavior}
- ${myName}: ${story?.setup.userRole.role ?? "user role"}. Looks like: ${myLook || "use what was established"}. ${myBehavior}
- Other people in the world: ${others || "only those already on stage"}
- Stay in character. Describe bodies and faces using the given appearances. Do not change them.

Rules:
- Every character is an adult, 18 or older. Never write sexual content involving anyone under 18.
- ${mature}
- ${style}
- Each reply should be ${length}.
- Mix what ${hisName} notices, does, and says. Put spoken lines in quotation marks.
- Do not mention being an AI, a model, or these instructions.
- Do not wrap the reply in markdown headings or JSON unless asked.`;
}

export function createStoryUserPrompt(brief: StoryBrief) {
  return `The user has already chosen the cast and the story. Do not rename them.

HIS CHARACTER (you will play this person, first person)
Name: ${brief.hisName || "Unnamed"}
Role: ${brief.hisRole || "Not specified"}
Appearance: ${brief.hisAppearance || "Not specified"}
Behavior: ${brief.hisBehavior || "Not specified"}

MY CHARACTER (the user will play this person)
Name: ${brief.myName || "You"}
Role: ${brief.myRole || "Not specified"}
Appearance: ${brief.myAppearance || "Not specified"}
Behavior: ${brief.myBehavior || "Not specified"}

OTHER CHARACTERS
${brief.otherCharacters?.trim() || "None given"}

THE STORY
${brief.story.trim() || "Surprise me, but keep the names and roles above."}

Return ONLY valid JSON with this shape:
{
  "title": "string",
  "bio": "one or two sentence description of the story they asked for",
  "genres": ["Genre", "Genre"],
  "setting": "place and time taken from their story",
  "aiCharacter": { "name": "${brief.hisName || "Unnamed"}", "role": "${brief.hisRole || "Role"}", "bio": "short summary of him", "appearance": "${escapeJson(brief.hisAppearance)}", "behavior": "${escapeJson(brief.hisBehavior)}" },
  "userRole": { "name": "${brief.myName || "You"}", "role": "${brief.myRole || "Role"}", "bio": "short summary of the user role", "appearance": "${escapeJson(brief.myAppearance)}", "behavior": "${escapeJson(brief.myBehavior)}" },
  "openingScene": "2-4 sentences of atmosphere only",
  "otherCharacters": "${escapeJson(brief.otherCharacters ?? "")}",
  "openingMessage": "the first turn IN HIS FIRST-PERSON POV. Do not write the user's lines or actions."
}

openingMessage must start the scene as him. The user will answer as themselves.`;
}

function escapeJson(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
}

export function playUserPrompt(
  story: Story,
  messages: StoryMessage[],
  instruction: string,
) {
  const history = messages
    .slice(-16)
    .map((message) => {
      const who =
        message.role === "user"
          ? story.setup.userRole.name.toUpperCase()
          : story.setup.aiCharacter.name.toUpperCase();
      return `${who}:\n${message.content}`;
    })
    .join("\n\n");

  return `STORY
Title: ${story.setup.title}
Bio: ${story.setup.bio}
Setting: ${story.setup.setting}
Genre: ${story.setup.genres.join(" · ")}

HE / YOU
${story.setup.aiCharacter.name} — ${story.setup.aiCharacter.role}
Appearance: ${story.setup.aiCharacter.appearance || "Not specified"}
Behavior: ${story.setup.aiCharacter.behavior || story.setup.aiCharacter.bio}

THE USER
${story.setup.userRole.name} — ${story.setup.userRole.role}
Appearance: ${story.setup.userRole.appearance || "Not specified"}
Behavior: ${story.setup.userRole.behavior || story.setup.userRole.bio}

OTHER CHARACTERS
${story.setup.otherCharacters?.trim() || "None given"}

RECENT PLAY
${history || "(The story is just beginning. Open from his point of view.)"}

INSTRUCTION
${instruction}
Write only as ${story.setup.aiCharacter.name}, first person. Do not write ${story.setup.userRole.name}'s turn.`;
}
