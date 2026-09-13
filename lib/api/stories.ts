import { generateStorySetup, generateStoryTurn } from "@/lib/ai/client";
import { applyBriefToSetup } from "@/lib/ai/setup";
import { apiEnabled, apiRequest, clearSession, ensureSession } from "@/lib/api/http";
import {
  continueScene,
  openingFromSetup,
  regenerateScene,
  replyFromUserMessage,
  setupFromPrompt,
} from "@/lib/mock-data";
import type {
  AppSettings,
  CreateStoryInput,
  Playthrough,
  Story,
  StoryBrief,
  StoryMessage,
  UserProfile,
} from "@/lib/types";
import { DEFAULT_PROFILE, DEFAULT_SETTINGS } from "@/lib/types";
import { createId, delay } from "@/lib/utils";

let onStoriesChange: ((stories: Story[]) => void) | null = null;

export function onStoriesPersisted(listener: (stories: Story[]) => void) {
  onStoriesChange = listener;
}

export const STORIES_KEY = "vesper.stories.v2";
export const LEGACY_STORIES_KEY = "vesper.stories.v1";
export const SETTINGS_KEY = "vesper.settings.v1";
export const PROFILE_KEY = "vesper.profile.v1";

function canUseStorage() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

const DEMO_STORY_IDS = new Set([
  "story_glass",
  "story_kingdom",
  "story_tokyo",
  "story_ocean",
]);

const DEMO_STORY_TITLES = new Set([
  "The Man Behind the Glass",
  "The Last Kingdom",
  "Midnight in Tokyo",
  "Beneath the Ocean",
]);

export function isDemoStory(story: Story) {
  return DEMO_STORY_IDS.has(story.id) || DEMO_STORY_TITLES.has(story.setup?.title);
}

export function withoutDemoStories(stories: Story[]) {
  return stories.filter((story) => !isDemoStory(story));
}

export function hydrateStories(): Story[] {
  if (canUseStorage()) {
    window.localStorage.removeItem(LEGACY_STORIES_KEY);
  }
  const stored = readJson<Story[] | null>(STORIES_KEY, null);
  if (stored && Array.isArray(stored)) {
    const next = withoutDemoStories(stored);
    if (next.length !== stored.length) {
      writeJson(STORIES_KEY, next);
    }
    return next;
  }
  writeJson(STORIES_KEY, []);
  return [];
}

export function persistStories(stories: Story[]) {
  writeJson(STORIES_KEY, stories);
  onStoriesChange?.(stories);
}

function upsertStory(stories: Story[], story: Story) {
  const next = stories.some((item) => item.id === story.id)
    ? stories.map((item) => (item.id === story.id ? story : item))
    : [story, ...stories];
  persistStories(next);
  return next;
}

export async function hydrateFromApi() {
  if (!apiEnabled() || typeof window === "undefined") return null;
  const session = await ensureSession();
  persistStories(withoutDemoStories(session.stories));
  persistSettings(session.settings, false);
  persistProfile(session.user, false);
  return session;
}

export function hydrateSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS, ...readJson<Partial<AppSettings>>(SETTINGS_KEY, {}) };
}

export function persistSettings(settings: AppSettings, remote = true) {
  writeJson(SETTINGS_KEY, settings);
  if (remote && apiEnabled() && typeof window !== "undefined") {
    void apiRequest("/settings", { method: "PATCH", body: settings }).catch(() => {});
  }
}

export function hydrateProfile(): UserProfile {
  return { ...DEFAULT_PROFILE, ...readJson<Partial<UserProfile>>(PROFILE_KEY, {}) };
}

export function persistProfile(profile: UserProfile, remote = true) {
  writeJson(PROFILE_KEY, profile);
  if (remote && apiEnabled() && typeof window !== "undefined") {
    void apiRequest("/user/profile", { method: "PATCH", body: profile }).catch(() => {});
  }
}

export async function getStories(stories: Story[]): Promise<Story[]> {
  await delay(280);
  return stories
    .slice()
    .sort((a, b) => +new Date(b.lastPlayedAt) - +new Date(a.lastPlayedAt));
}

export async function getStory(stories: Story[], id: string): Promise<Story | null> {
  await delay(180);
  return stories.find((story) => story.id === id) ?? null;
}

export function getActivePlaythrough(story: Story): Playthrough {
  return (
    story.playthroughs.find((playthrough) => playthrough.id === story.activePlaythroughId) ??
    story.playthroughs[story.playthroughs.length - 1]
  );
}

function briefFromPrompt(prompt: string): StoryBrief {
  return {
    story: prompt,
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
}

export async function createStoryFromPrompt(
  stories: Story[],
  promptOrBrief: string | StoryBrief,
  settings: AppSettings = DEFAULT_SETTINGS,
): Promise<{ stories: Story[]; story: Story }> {
  const brief = typeof promptOrBrief === "string" ? briefFromPrompt(promptOrBrief) : promptOrBrief;
  if (apiEnabled()) {
    const story = await apiRequest<Story>("/story", {
      method: "POST",
      body: { brief, settings },
    });
    const next = [story, ...stories.filter((item) => item.id !== story.id)];
    persistStories(next);
    return { stories: next, story };
  }
  let setup = applyBriefToSetup(setupFromPrompt(brief.story), brief);
  let openingText = openingFromSetup(setup);
  try {
    const generated = await generateStorySetup(brief, settings);
    setup = applyBriefToSetup(generated.setup, brief);
    openingText = generated.openingMessage || openingFromSetup(setup);
  } catch (error) {
    if (!fallbackAllowed(error)) throw error;
  }

  const now = new Date().toISOString();
  const opening: StoryMessage = {
    id: createId("msg"),
    role: "assistant",
    content: openingText,
    createdAt: now,
    characterName: setup.aiCharacter.name,
  };
  const playthrough: Playthrough = {
    id: createId("pt"),
    number: 1,
    status: "active",
    startedAt: now,
    lastPlayedAt: now,
    messages: [opening],
    chapters: [
      {
        id: createId("ch"),
        title: "The Opening",
        summary: setup.openingScene.slice(0, 92),
      },
    ],
    memories: [{ id: createId("mem"), text: `The story began from: “${brief.story.trim() || "Surprise me."}”` }],
  };

  const story: Story = {
    id: createId("story"),
    status: "active",
    createdAt: now,
    lastPlayedAt: now,
    setup,
    playthroughs: [playthrough],
    activePlaythroughId: playthrough.id,
  };

  const next = [story, ...stories];
  persistStories(next);
  return { stories: next, story };
}

export async function createStory(
  stories: Story[],
  input: CreateStoryInput,
): Promise<{ stories: Story[]; story: Story }> {
  return createStoryFromPrompt(stories, input.prompt, DEFAULT_SETTINGS);
}

export async function sendMessage(
  stories: Story[],
  storyId: string,
  content: string,
  settings: AppSettings = DEFAULT_SETTINGS,
): Promise<{ stories: Story[]; userMessage: StoryMessage; assistantMessage: StoryMessage }> {
  if (apiEnabled()) {
    const data = await apiRequest<{
      story: Story;
      userMessage: StoryMessage;
      assistantMessage: StoryMessage;
    }>(`/story/${storyId}/messages`, {
      method: "POST",
      body: { content, settings },
    });
    return {
      stories: upsertStory(stories, data.story),
      userMessage: data.userMessage,
      assistantMessage: data.assistantMessage,
    };
  }
  const story = stories.find((item) => item.id === storyId);
  if (!story) throw new Error("Story not found");
  const playthrough = getActivePlaythrough(story);
  const now = new Date().toISOString();
  const userMessage: StoryMessage = {
    id: createId("msg"),
    role: "user",
    content,
    createdAt: now,
  };

  let reply = replyFromUserMessage(story, content);
  try {
    reply = await generateStoryTurn(
      "reply",
      story,
      [...playthrough.messages, userMessage],
      settings,
      `The user just wrote ${story.setup.userRole.name}'s turn:\n${content}\n\nAnswer only as ${story.setup.aiCharacter.name}, first person. Do not write ${story.setup.userRole.name}'s actions.`,
    );
  } catch (error) {
    if (!fallbackAllowed(error)) throw error;
  }

  const next = stories.map((item) => {
    if (item.id !== storyId) return item;
    const assistantMessage: StoryMessage = {
      id: createId("msg"),
      role: "assistant",
      content: reply,
      createdAt: new Date().toISOString(),
      characterName: item.setup.aiCharacter.name,
    };
    return patchPlaythrough(item, playthrough.id, (current) => ({
      ...current,
      lastPlayedAt: assistantMessage.createdAt,
      messages: [...current.messages, userMessage, assistantMessage],
    }));
  });

  persistStories(next);
  const updated = next.find((item) => item.id === storyId);
  if (!updated) {
    throw new Error("Story not found");
  }
  const assistantMessage = getActivePlaythrough(updated).messages.at(-1);
  if (!assistantMessage) {
    throw new Error("Reply was not saved");
  }
  return { stories: next, userMessage, assistantMessage };
}

export async function continueStory(
  stories: Story[],
  storyId: string,
  settings: AppSettings = DEFAULT_SETTINGS,
): Promise<{ stories: Story[]; assistantMessage: StoryMessage }> {
  if (apiEnabled()) {
    const data = await apiRequest<{ story: Story; assistantMessage: StoryMessage }>(
      `/story/${storyId}/continue`,
      { method: "POST", body: { settings } },
    );
    return {
      stories: upsertStory(stories, data.story),
      assistantMessage: data.assistantMessage,
    };
  }
  const story = stories.find((item) => item.id === storyId);
  if (!story) throw new Error("Story not found");
  const playthrough = getActivePlaythrough(story);
  let content = continueScene(story);
  try {
    content = await generateStoryTurn("continue", story, playthrough.messages, settings);
  } catch (error) {
    if (!fallbackAllowed(error)) throw error;
  }

  let created: StoryMessage | null = null;
  const next = stories.map((item) => {
    if (item.id !== storyId) return item;
    created = {
      id: createId("msg"),
      role: "assistant",
      content,
      createdAt: new Date().toISOString(),
      characterName: item.setup.aiCharacter.name,
    };
    return patchPlaythrough(item, playthrough.id, (current) => ({
      ...current,
      lastPlayedAt: created!.createdAt,
      messages: [...current.messages, created!],
    }));
  });
  persistStories(next);
  if (!created) throw new Error("Story not found");
  return { stories: next, assistantMessage: created };
}

export async function regenerateMessage(
  stories: Story[],
  storyId: string,
  messageId: string,
  settings: AppSettings = DEFAULT_SETTINGS,
): Promise<{ stories: Story[]; assistantMessage: StoryMessage }> {
  if (apiEnabled()) {
    const data = await apiRequest<{ story: Story; assistantMessage: StoryMessage }>(
      `/story/${storyId}/messages/${messageId}/regenerate`,
      { method: "POST", body: { settings } },
    );
    return {
      stories: upsertStory(stories, data.story),
      assistantMessage: data.assistantMessage,
    };
  }
  const story = stories.find((item) => item.id === storyId);
  if (!story) throw new Error("Story not found");
  const playthrough = getActivePlaythrough(story);
  let content = regenerateScene(story);
  try {
    content = await generateStoryTurn("regenerate", story, playthrough.messages, settings);
  } catch (error) {
    if (!fallbackAllowed(error)) throw error;
  }

  let updated: StoryMessage | null = null;
  const next = stories.map((item) => {
    if (item.id !== storyId) return item;
    return patchPlaythrough(item, playthrough.id, (current) => ({
      ...current,
      lastPlayedAt: new Date().toISOString(),
      messages: current.messages.map((message) => {
        if (message.id !== messageId) return message;
        updated = {
          ...message,
          content,
          createdAt: new Date().toISOString(),
        };
        return updated;
      }),
    }));
  });
  persistStories(next);
  if (!updated) throw new Error("Message not found");
  return { stories: next, assistantMessage: updated };
}

export async function editMessage(
  stories: Story[],
  storyId: string,
  messageId: string,
  content: string,
): Promise<Story[]> {
  if (apiEnabled()) {
    const story = await apiRequest<Story>(`/story/${storyId}/messages/${messageId}`, {
      method: "PATCH",
      body: { content },
    });
    return upsertStory(stories, story);
  }
  await delay(160);
  const next = stories.map((story) => {
    if (story.id !== storyId) return story;
    const playthrough = getActivePlaythrough(story);
    return patchPlaythrough(story, playthrough.id, (current) => ({
      ...current,
      messages: current.messages.map((message) =>
        message.id === messageId ? { ...message, content } : message,
      ),
    }));
  });
  persistStories(next);
  return next;
}

export async function deleteMessage(
  stories: Story[],
  storyId: string,
  messageId: string,
): Promise<Story[]> {
  if (apiEnabled()) {
    const story = await apiRequest<Story>(`/story/${storyId}/messages/${messageId}`, {
      method: "DELETE",
    });
    return upsertStory(stories, story);
  }
  await delay(140);
  const next = stories.map((story) => {
    if (story.id !== storyId) return story;
    const playthrough = getActivePlaythrough(story);
    return patchPlaythrough(story, playthrough.id, (current) => ({
      ...current,
      messages: current.messages.filter((message) => message.id !== messageId),
    }));
  });
  persistStories(next);
  return next;
}

export async function restartStory(
  stories: Story[],
  storyId: string,
  settings: AppSettings = DEFAULT_SETTINGS,
): Promise<{ stories: Story[]; story: Story; playthrough: Playthrough }> {
  if (apiEnabled()) {
    const data = await apiRequest<{ story: Story; playthrough: Playthrough }>(
      `/story/${storyId}/restart`,
      { method: "POST", body: { settings } },
    );
    return {
      stories: upsertStory(stories, data.story),
      story: data.story,
      playthrough: data.playthrough,
    };
  }
  const story = stories.find((item) => item.id === storyId);
  if (!story) throw new Error("Story not found");
  let openingText = `${story.setup.openingScene}\n\n${story.setup.aiCharacter.name} met your eyes as if the first hour had never been spent.\n\n“Again,” they said. “From the beginning. This time, we may choose differently.”`;
  try {
    openingText = await generateStoryTurn("restart", story, [], settings);
  } catch (error) {
    if (!fallbackAllowed(error)) throw error;
  }

  const now = new Date().toISOString();

  const next = stories.map((item) => {
    if (item.id !== storyId) return item;
    const archived = item.playthroughs.map((playthrough) =>
      playthrough.id === item.activePlaythroughId
        ? { ...playthrough, status: "completed" as const }
        : playthrough,
    );
    const opening: StoryMessage = {
      id: createId("msg"),
      role: "assistant",
      content: openingText,
      createdAt: now,
      characterName: item.setup.aiCharacter.name,
    };
    const playthrough: Playthrough = {
      id: createId("pt"),
      number: Math.max(...item.playthroughs.map((entry) => entry.number)) + 1,
      status: "active",
      startedAt: now,
      lastPlayedAt: now,
      messages: [opening],
      chapters: [
        {
          id: createId("ch"),
          title: "A New Beginning",
          summary: "The original setup, opened once more.",
        },
      ],
      memories: [
        {
          id: createId("mem"),
          text: "This playthrough begins from the original story concept.",
        },
      ],
    };
    const updated: Story = {
      ...item,
      status: "active",
      lastPlayedAt: now,
      playthroughs: [...archived, playthrough],
      activePlaythroughId: playthrough.id,
    };
    return updated;
  });

  persistStories(next);
  const restarted = next.find((item) => item.id === storyId);
  if (!restarted) throw new Error("Story not found");
  return { stories: next, story: restarted, playthrough: getActivePlaythrough(restarted) };
}

export async function setActivePlaythrough(
  stories: Story[],
  storyId: string,
  playthroughId: string,
): Promise<Story[]> {
  if (apiEnabled()) {
    const story = await apiRequest<Story>(`/story/${storyId}/playthrough`, {
      method: "PATCH",
      body: { playthroughId },
    });
    return upsertStory(stories, story);
  }
  await delay(120);
  const next = stories.map((story) =>
    story.id === storyId
      ? {
          ...story,
          activePlaythroughId: playthroughId,
          lastPlayedAt: new Date().toISOString(),
        }
      : story,
  );
  persistStories(next);
  return next;
}

export async function renameStory(stories: Story[], storyId: string, title: string): Promise<Story[]> {
  if (apiEnabled()) {
    const story = await apiRequest<Story>(`/story/${storyId}`, {
      method: "PATCH",
      body: { title },
    });
    return upsertStory(stories, story);
  }
  await delay(140);
  const next = stories.map((story) =>
    story.id === storyId
      ? { ...story, setup: { ...story.setup, title: title.trim() || story.setup.title } }
      : story,
  );
  persistStories(next);
  return next;
}

export async function toggleFavorite(stories: Story[], storyId: string): Promise<Story[]> {
  if (apiEnabled()) {
    const story = await apiRequest<Story>(`/story/${storyId}/favorite`, { method: "POST" });
    return upsertStory(stories, story);
  }
  const next = stories.map((story) =>
    story.id === storyId ? { ...story, favorited: !story.favorited } : story,
  );
  persistStories(next);
  return next;
}

export async function deleteStory(stories: Story[], storyId: string): Promise<Story[]> {
  if (apiEnabled()) {
    await apiRequest(`/story/${storyId}`, { method: "DELETE" });
    const next = stories.filter((story) => story.id !== storyId);
    persistStories(next);
    return next;
  }
  await delay(160);
  const next = stories.filter((story) => story.id !== storyId);
  persistStories(next);
  return next;
}

export async function getPlaythroughs(story: Story): Promise<Playthrough[]> {
  await delay(80);
  return story.playthroughs
    .slice()
    .sort((a, b) => b.number - a.number);
}

function fallbackAllowed(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return message.includes("OPENROUTER_API_KEY is missing");
}

function patchPlaythrough(
  story: Story,
  playthroughId: string,
  updater: (playthrough: Playthrough) => Playthrough,
): Story {
  const playthroughs = story.playthroughs.map((playthrough) =>
    playthrough.id === playthroughId ? updater(playthrough) : playthrough,
  );
  const active = playthroughs.find((item) => item.id === playthroughId);
  return {
    ...story,
    playthroughs,
    lastPlayedAt: active?.lastPlayedAt ?? story.lastPlayedAt,
    status: "active",
  };
}
