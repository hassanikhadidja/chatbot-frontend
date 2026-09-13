"use client";

import { AIMessage } from "@/components/chat/ai-message";
import { UserMessage } from "@/components/chat/user-message";
import type { Story, StoryMessage } from "@/lib/types";

export function MessageList({
  story,
  messages,
  showTimestamps,
  streamingId,
  onRegenerate,
  onContinue,
  onCopy,
  onEdit,
  onReport,
  onDelete,
}: {
  story: Story;
  messages: StoryMessage[];
  showTimestamps?: boolean;
  streamingId?: string | null;
  onRegenerate: (message: StoryMessage) => void;
  onContinue: () => void;
  onCopy: (content: string) => void;
  onEdit: (message: StoryMessage, content: string) => void;
  onReport: () => void;
  onDelete: (message: StoryMessage) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6">
      {messages.map((message) =>
        message.role === "assistant" ? (
          <AIMessage
            key={message.id}
            story={story}
            message={message}
            showTimestamp={showTimestamps}
            streaming={streamingId === message.id}
            onRegenerate={() => onRegenerate(message)}
            onContinue={onContinue}
            onCopy={onCopy}
            onEdit={(content) => onEdit(message, content)}
            onReport={onReport}
          />
        ) : (
          <UserMessage
            key={message.id}
            message={message}
            showTimestamp={showTimestamps}
            onCopy={onCopy}
            onEdit={(content) => onEdit(message, content)}
            onDelete={() => onDelete(message)}
          />
        ),
      )}
    </div>
  );
}
