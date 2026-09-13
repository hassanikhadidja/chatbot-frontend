import {
  hydrateFromApi,
  hydrateProfile,
  hydrateSettings,
  hydrateStories,
  LEGACY_STORIES_KEY,
  onStoriesPersisted,
  persistProfile,
  persistSettings,
  persistStories,
  PROFILE_KEY,
  SETTINGS_KEY,
  STORIES_KEY,
  withoutDemoStories,
} from "@/lib/api/stories";
import { apiEnabled, apiRequest, clearSession } from "@/lib/api/http";
import type { AppSettings, Story, UserProfile } from "@/lib/types";
import { DEFAULT_PROFILE, DEFAULT_SETTINGS } from "@/lib/types";

let settingsSnapshot: AppSettings = DEFAULT_SETTINGS;
let profileSnapshot: UserProfile = DEFAULT_PROFILE;
let storiesSnapshot: Story[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeClientStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function ensureClientStore() {
  if (typeof window === "undefined") return;
  if (!hydrated) {
    settingsSnapshot = hydrateSettings();
    profileSnapshot = hydrateProfile();
    storiesSnapshot = withoutDemoStories(hydrateStories());
    hydrated = true;
    return;
  }
  const cleaned = withoutDemoStories(storiesSnapshot);
  if (cleaned.length !== storiesSnapshot.length) {
    storiesSnapshot = cleaned;
    persistStories(cleaned);
  }
}

export function getSettingsSnapshot() {
  ensureClientStore();
  return settingsSnapshot;
}

export function getProfileSnapshot() {
  ensureClientStore();
  return profileSnapshot;
}

export function getServerSnapshotSettings() {
  return DEFAULT_SETTINGS;
}

export function getServerSnapshotProfile() {
  return DEFAULT_PROFILE;
}

export function getStoriesSnapshot() {
  ensureClientStore();
  return storiesSnapshot;
}

export function getServerSnapshotStories(): Story[] {
  return [];
}

export function writeStories(next: Story[]) {
  storiesSnapshot = next;
  emit();
}

onStoriesPersisted((next) => {
  storiesSnapshot = next;
  emit();
});

export async function hydrateClientFromApi() {
  if (!apiEnabled() || typeof window === "undefined") return;
  const session = await hydrateFromApi();
  if (!session) return;
  settingsSnapshot = session.settings;
  profileSnapshot = session.user;
  storiesSnapshot = withoutDemoStories(session.stories);
  hydrated = true;
  emit();
}

export function resetClientData() {
  if (typeof window !== "undefined") {
    if (apiEnabled()) {
      void apiRequest("/user/account", { method: "DELETE" }).catch(() => {});
    }
    window.localStorage.removeItem(LEGACY_STORIES_KEY);
    window.localStorage.removeItem(STORIES_KEY);
    window.localStorage.removeItem(SETTINGS_KEY);
    window.localStorage.removeItem(PROFILE_KEY);
    clearSession();
  }
  settingsSnapshot = DEFAULT_SETTINGS;
  profileSnapshot = DEFAULT_PROFILE;
  storiesSnapshot = [];
  hydrated = true;
  emit();
}

export function writeSettings(next: AppSettings) {
  settingsSnapshot = next;
  persistSettings(next);
  emit();
}

export function writeProfile(next: UserProfile) {
  profileSnapshot = next;
  persistProfile(next);
  emit();
}
