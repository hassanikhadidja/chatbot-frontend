import { completeChat, hasOpenRouterKey } from "@/lib/ai/openrouter";
import { createStoryUserPrompt, createSystemPrompt, playUserPrompt, storySystemPrompt } from "@/lib/ai/prompts";
import { coverForGenres, hueFromName } from "@/lib/ai/covers";
import { applyBriefToSetup, preferText } from "@/lib/ai/setup";
import type { AppSettings, ResponseLength, Story, StoryBrief, StoryMessage, StorySetup } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";

export const runtime = "nodejs";

interface CreateResult {
  setup: StorySetup;
  openingMessage: string;
}

function parseJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("The model did not return story JSON.");
  }
  return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
}

function asRecord(value: unknown) {
  return (value ?? {}) as Record<string, unknown>;
}

function asCharacter(
  value: unknown,
  fallbackName: string,
  hue: number,
  fallbackBehavior = "",
  fallbackAppearance = "",
) {
  const data = asRecord(value);
  return {
    name: preferText(data.name, fallbackName),
    role: preferText(data.role, "Role"),
    bio: preferText(data.bio, fallbackBehavior),
    behavior: preferText(data.behavior, fallbackBehavior),
    appearance: preferText(data.appearance, fallbackAppearance),
    avatarHue: hue,
  };
}

function tokensForLength(length: ResponseLength, json = false) {
  if (json) return 1600;
  if (length === "short") return 600;
  if (length === "long") return 2800;
  return 1400;
}

function toSetup(raw: Record<string, unknown>, brief?: StoryBrief): CreateResult {
  const genres = Array.isArray(raw.genres)
    ? raw.genres.map((item) => String(item)).filter(Boolean)
    : ["Drama"];
  const cover = coverForGenres(genres);
  const rawAi = asRecord(raw.aiCharacter);
  const rawUser = asRecord(raw.userRole);
  const aiName = preferText(brief?.hisName, rawAi.name, "The Companion");
  const userName = preferText(brief?.myName, rawUser.name, "You");

  const setup = {
    title: preferText(raw.title, "Untitled Story"),
    bio: preferText(raw.bio, brief?.story),
    genres,
    setting: preferText(raw.setting),
    aiCharacter: asCharacter(
      {
        name: aiName,
        role: preferText(brief?.hisRole, rawAi.role),
        bio: rawAi.bio,
        behavior: preferText(brief?.hisBehavior, rawAi.behavior),
        appearance: preferText(brief?.hisAppearance, rawAi.appearance),
      },
      aiName,
      hueFromName(aiName),
      preferText(brief?.hisBehavior, rawAi.behavior),
      preferText(brief?.hisAppearance, rawAi.appearance),
    ),
    userRole: asCharacter(
      {
        name: userName,
        role: preferText(brief?.myRole, rawUser.role),
        bio: rawUser.bio,
        behavior: preferText(brief?.myBehavior, rawUser.behavior),
        appearance: preferText(brief?.myAppearance, rawUser.appearance),
      },
      userName,
      hueFromName(userName, 80),
      preferText(brief?.myBehavior, rawUser.behavior),
      preferText(brief?.myAppearance, rawUser.appearance),
    ),
    openingScene: preferText(raw.openingScene),
    otherCharacters: preferText(brief?.otherCharacters, raw.otherCharacters),
    coverImage: cover.image,
    coverTone: cover.tone,
  };

  return {
    setup: brief ? applyBriefToSetup(setup, brief) : setup,
    openingMessage: preferText(raw.openingMessage, raw.openingScene),
  };
}

export async function POST(request: Request) {
  if (!hasOpenRouterKey()) {
    return Response.json({ error: "OPENROUTER_API_KEY is missing." }, { status: 503 });
  }

  const body = (await request.json()) as {
    action?: "create" | "reply" | "continue" | "regenerate" | "restart" | "translate";
    prompt?: string;
    brief?: StoryBrief;
    instruction?: string;
    text?: string;
    settings?: AppSettings;
    story?: Story;
    messages?: StoryMessage[];
  };

  const settings = { ...DEFAULT_SETTINGS, ...body.settings };

  try {
    if (body.action === "translate") {
      const source = body.text?.trim();
      if (!source) {
        return Response.json({ error: "Nothing to translate." }, { status: 400 });
      }
      const content = await completeChat([
        {
          role: "system",
          content:
            "You are a literary translator. Translate the user's text into natural Modern Standard Arabic. Keep names, tone, narration, and dialogue structure. Do not add notes, titles, or English.",
        },
        { role: "user", content: source },
      ]);
      return Response.json({ content });
    }

    if (body.action === "create") {
      const brief: StoryBrief = body.brief ?? {
        story: body.prompt ?? "",
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
      const content = await completeChat(
        [
          { role: "system", content: createSystemPrompt(settings) },
          { role: "user", content: createStoryUserPrompt(brief) },
        ],
        { json: true, maxTokens: tokensForLength(settings.responseLength, true) },
      );
      return Response.json(toSetup(parseJsonObject(content), brief));
    }

    if (!body.story) {
      return Response.json({ error: "Story is required." }, { status: 400 });
    }

    const instruction =
      body.action === "continue"
        ? "Continue the scene without repeating the last paragraph. Advance time, sensation, or dialogue."
        : body.action === "regenerate"
          ? "Rewrite the last AI turn in a fresh way. Keep the same facts, change the wording and the cut of the scene."
          : body.action === "restart"
            ? "Write a new opening turn from the original setup. Do not assume any previous playthrough happened."
            : body.instruction ?? "Write the next story turn in response to the user.";

    const content = await completeChat(
      [
        { role: "system", content: storySystemPrompt(settings, body.story) },
        {
          role: "user",
          content: playUserPrompt(body.story, body.messages ?? [], instruction),
        },
      ],
      { maxTokens: tokensForLength(settings.responseLength) },
    );

    return Response.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The story could not be written.";
    return Response.json({ error: message }, { status: 502 });
  }
}
