export type StoryStatus = "active" | "paused" | "completed";
export type PlaythroughStatus = "active" | "completed";
export type MessageRole = "user" | "assistant";
export type ThemePreference = "dark" | "light" | "system";
export type ResponseLength = "short" | "balanced" | "long";
export type NarrationStyle = "literary" | "cinematic" | "conversational";
export type ViewMode = "grid" | "list";
export type StorySort = "lastPlayed" | "title" | "created";

export interface StoryCharacter {
  name: string;
  role: string;
  bio: string;
  behavior?: string;
  appearance?: string;
  avatarHue: number;
}

export interface StoryBrief {
  story: string;
  hisName: string;
  hisRole: string;
  hisAppearance: string;
  hisBehavior: string;
  myName: string;
  myRole: string;
  myAppearance: string;
  myBehavior: string;
  otherCharacters?: string;
}

export interface StorySetup {
  title: string;
  bio: string;
  genres: string[];
  setting: string;
  aiCharacter: StoryCharacter;
  userRole: StoryCharacter;
  openingScene: string;
  otherCharacters?: string;
  coverImage: string;
  coverTone: string;
}

export interface StoryMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  characterName?: string;
}

export interface Chapter {
  id: string;
  title: string;
  summary: string;
}

export interface MemoryNote {
  id: string;
  text: string;
}

export interface Playthrough {
  id: string;
  number: number;
  status: PlaythroughStatus;
  startedAt: string;
  lastPlayedAt: string;
  messages: StoryMessage[];
  chapters: Chapter[];
  memories: MemoryNote[];
}

export interface Story {
  id: string;
  status: StoryStatus;
  createdAt: string;
  lastPlayedAt: string;
  setup: StorySetup;
  playthroughs: Playthrough[];
  activePlaythroughId: string;
  favorited?: boolean;
}

export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  joinedAt: string;
}

export interface AppSettings {
  theme: ThemePreference;
  responseLength: ResponseLength;
  narrationStyle: NarrationStyle;
  contentPreference: "standard" | "mature";
  enterToSend: boolean;
  showTimestamps: boolean;
}

export interface CreateStoryInput {
  prompt: string;
  setup: StorySetup;
  openingMessage: StoryMessage;
}

export interface SendMessageInput {
  storyId: string;
  content: string;
}

export const ALL_GENRES = [
  "Mystery",
  "Romance",
  "Fantasy",
  "Adventure",
  "Thriller",
  "Sci-Fi",
  "Drama",
  "Horror",
] as const;

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  responseLength: "balanced",
  narrationStyle: "literary",
  contentPreference: "mature",
  enterToSend: true,
  showTimestamps: false,
};

export const DEFAULT_PROFILE: UserProfile = {
  username: "elena",
  displayName: "Elena",
  bio: "Collector of unfinished worlds.",
  joinedAt: "2026-03-12T10:00:00.000Z",
};
