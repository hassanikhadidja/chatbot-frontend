"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import * as api from "@/lib/api/stories";
import {
  getServerSnapshotStories,
  getSettingsSnapshot,
  getStoriesSnapshot,
  subscribeClientStore,
} from "@/lib/client-store";
import type { Playthrough, Story, StoryBrief, StoryMessage } from "@/lib/types";

interface StoriesContextValue {
  stories: Story[];
  ready: boolean;
  error: string | null;
  hydrate: () => void;
  getStory: (id: string) => Story | undefined;
  createStoryFromPrompt: (brief: string | StoryBrief) => Promise<Story>;
  sendMessage: (storyId: string, content: string) => Promise<StoryMessage>;
  continueStory: (storyId: string) => Promise<StoryMessage>;
  regenerateMessage: (storyId: string, messageId: string) => Promise<StoryMessage>;
  editMessage: (storyId: string, messageId: string, content: string) => Promise<void>;
  deleteMessage: (storyId: string, messageId: string) => Promise<void>;
  restartStory: (storyId: string) => Promise<Playthrough>;
  setActivePlaythrough: (storyId: string, playthroughId: string) => Promise<void>;
  renameStory: (storyId: string, title: string) => Promise<void>;
  toggleFavorite: (storyId: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
}

const StoriesContext = createContext<StoriesContextValue | null>(null);

export function StoriesProvider({ children }: { children: ReactNode }) {
  const stories = useSyncExternalStore(
    subscribeClientStore,
    getStoriesSnapshot,
    getServerSnapshotStories,
  );
  const ready = typeof window !== "undefined";

  const hydrate = useCallback(() => {
    getStoriesSnapshot();
  }, []);

  const getStory = useCallback(
    (id: string) => stories.find((story) => story.id === id),
    [stories],
  );

  const createStoryFromPrompt = useCallback(async (brief: string | StoryBrief) => {
    const result = await api.createStoryFromPrompt(
      getStoriesSnapshot(),
      brief,
      getSettingsSnapshot(),
    );
    return result.story;
  }, []);

  const sendMessage = useCallback(async (storyId: string, content: string) => {
    const result = await api.sendMessage(
      getStoriesSnapshot(),
      storyId,
      content,
      getSettingsSnapshot(),
    );
    return result.assistantMessage;
  }, []);

  const continueStory = useCallback(async (storyId: string) => {
    const result = await api.continueStory(
      getStoriesSnapshot(),
      storyId,
      getSettingsSnapshot(),
    );
    return result.assistantMessage;
  }, []);

  const regenerateMessage = useCallback(async (storyId: string, messageId: string) => {
    const result = await api.regenerateMessage(
      getStoriesSnapshot(),
      storyId,
      messageId,
      getSettingsSnapshot(),
    );
    return result.assistantMessage;
  }, []);

  const editMessage = useCallback(async (storyId: string, messageId: string, content: string) => {
    await api.editMessage(getStoriesSnapshot(), storyId, messageId, content);
  }, []);

  const deleteMessage = useCallback(async (storyId: string, messageId: string) => {
    await api.deleteMessage(getStoriesSnapshot(), storyId, messageId);
  }, []);

  const restartStory = useCallback(async (storyId: string) => {
    const result = await api.restartStory(
      getStoriesSnapshot(),
      storyId,
      getSettingsSnapshot(),
    );
    return result.playthrough;
  }, []);

  const setActivePlaythrough = useCallback(async (storyId: string, playthroughId: string) => {
    await api.setActivePlaythrough(getStoriesSnapshot(), storyId, playthroughId);
  }, []);

  const renameStory = useCallback(async (storyId: string, title: string) => {
    await api.renameStory(getStoriesSnapshot(), storyId, title);
  }, []);

  const toggleFavorite = useCallback(async (storyId: string) => {
    await api.toggleFavorite(getStoriesSnapshot(), storyId);
  }, []);

  const deleteStoryFn = useCallback(async (storyId: string) => {
    await api.deleteStory(getStoriesSnapshot(), storyId);
  }, []);

  const value = useMemo<StoriesContextValue>(
    () => ({
      stories,
      ready,
      error: null,
      hydrate,
      getStory,
      createStoryFromPrompt,
      sendMessage,
      continueStory,
      regenerateMessage,
      editMessage,
      deleteMessage,
      restartStory,
      setActivePlaythrough,
      renameStory,
      toggleFavorite,
      deleteStory: deleteStoryFn,
    }),
    [
      stories,
      ready,
      hydrate,
      getStory,
      createStoryFromPrompt,
      sendMessage,
      continueStory,
      regenerateMessage,
      editMessage,
      deleteMessage,
      restartStory,
      setActivePlaythrough,
      renameStory,
      toggleFavorite,
      deleteStoryFn,
    ],
  );

  return <StoriesContext.Provider value={value}>{children}</StoriesContext.Provider>;
}

export function useStories() {
  const context = useContext(StoriesContext);
  if (!context) {
    throw new Error("useStories must be used within StoriesProvider");
  }
  return context;
}
