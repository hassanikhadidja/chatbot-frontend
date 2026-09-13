"use client";

import { useEffect, useRef, useState } from "react";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { useSettings } from "@/context/settings-context";
import { useStories } from "@/context/stories-context";
import { useUI } from "@/context/ui-context";
import { getActivePlaythrough } from "@/lib/api/stories";
import type { Story, StoryMessage } from "@/lib/types";

export function ChatContainer({ story }: { story: Story }) {
  const { settings } = useSettings();
  const { toast } = useUI();
  const {
    sendMessage,
    continueStory,
    regenerateMessage,
    editMessage,
    deleteMessage,
  } = useStories();
  const [draft, setDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [streamTarget, setStreamTarget] = useState<StoryMessage | null>(null);
  const abortRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const playthrough = getActivePlaythrough(story);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [playthrough.messages.length, streamingText, generating]);

  async function streamIn(message: StoryMessage) {
    abortRef.current = false;
    setStreamTarget(message);
    setStreamingText("");
    const words = message.content.split(/(\s+)/);
    let next = "";
    for (const word of words) {
      if (abortRef.current) break;
      next += word;
      setStreamingText(next);
      await new Promise((resolve) => setTimeout(resolve, 16));
    }
    setStreamTarget(null);
    setStreamingText("");
  }

  async function handleSend() {
    const content = draft.trim();
    if (!content || generating) return;
    setDraft("");
    setGenerating(true);
    try {
      const message = await sendMessage(story.id, content);
      await streamIn(message);
    } catch (error) {
      toast(
        "The reply could not be written.",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleContinue() {
    if (generating) return;
    setGenerating(true);
    try {
      const message = await continueStory(story.id);
      await streamIn(message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleRegenerate(message: StoryMessage) {
    if (generating) return;
    setGenerating(true);
    try {
      const next = await regenerateMessage(story.id, message.id);
      await streamIn(next);
    } finally {
      setGenerating(false);
    }
  }

  const visibleMessages =
    streamTarget && streamingText
      ? playthrough.messages.map((message) =>
          message.id === streamTarget.id ? { ...message, content: streamingText } : message,
        )
      : playthrough.messages;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto story-scroll">
        <MessageList
          story={story}
          messages={visibleMessages}
          showTimestamps={settings.showTimestamps}
          streamingId={streamTarget?.id}
          onRegenerate={handleRegenerate}
          onContinue={handleContinue}
          onCopy={async (content) => {
            await navigator.clipboard.writeText(content);
            toast("Copied");
          }}
          onEdit={(message, content) => {
            void editMessage(story.id, message.id, content);
          }}
          onReport={() => toast("Report submitted")}
          onDelete={(message) => {
            void deleteMessage(story.id, message.id);
          }}
        />
        {generating && !streamTarget ? (
          <div className="mx-auto max-w-3xl px-4 pb-6">
            <TypingIndicator name={story.setup.aiCharacter.name} />
          </div>
        ) : null}
        <div ref={endRef} />
      </div>
      <ChatInput
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        onStop={() => {
          abortRef.current = true;
          setGenerating(false);
          setStreamTarget(null);
        }}
        generating={generating}
        enterToSend={settings.enterToSend}
        placeholder={`Write ${story.setup.userRole.name}'s turn…`}
      />
    </div>
  );
}
