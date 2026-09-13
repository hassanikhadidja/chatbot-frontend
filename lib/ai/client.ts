import type { AppSettings, Story, StoryBrief, StoryMessage, StorySetup } from "@/lib/types";

async function request<T>(payload: Record<string, unknown>): Promise<T> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? "The story could not be written.");
  }
  return data;
}

export async function generateStorySetup(brief: StoryBrief, settings: AppSettings) {
  return request<{ setup: StorySetup; openingMessage: string }>({
    action: "create",
    brief,
    prompt: brief.story,
    settings,
  });
}

export async function generateStoryTurn(
  action: "reply" | "continue" | "regenerate" | "restart",
  story: Story,
  messages: StoryMessage[],
  settings: AppSettings,
  instruction?: string,
) {
  const data = await request<{ content: string }>({
    action,
    story,
    messages,
    settings,
    instruction,
  });
  return data.content;
}

export async function translateToArabic(text: string) {
  const data = await request<{ content: string }>({
    action: "translate",
    text,
  });
  return data.content;
}
