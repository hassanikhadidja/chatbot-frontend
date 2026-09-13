"use client";

import { useState } from "react";
import { MessageActions } from "@/components/chat/message-actions";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useArabicTranslation } from "@/lib/hooks/use-arabic-translation";
import { StoryText } from "@/lib/parse-story-text";
import type { Story, StoryMessage } from "@/lib/types";
import { formatTime } from "@/lib/utils";

export function AIMessage({
  story,
  message,
  showTimestamp,
  streaming,
  onRegenerate,
  onContinue,
  onCopy,
  onEdit,
  onReport,
}: {
  story: Story;
  message: StoryMessage;
  showTimestamp?: boolean;
  streaming?: boolean;
  onRegenerate: () => void;
  onContinue: () => void;
  onCopy: (content: string) => void;
  onEdit: (content: string) => void;
  onReport: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const translation = useArabicTranslation(message.content);
  const character = story.setup.aiCharacter;

  return (
    <article className="group animate-fade-up">
      <div className="mb-3 flex items-center gap-3">
        <Avatar name={character.name} hue={character.avatarHue} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{message.characterName ?? character.name}</p>
          {showTimestamp ? <p className="text-xs text-subtle">{formatTime(message.createdAt)}</p> : null}
        </div>
        {!streaming ? (
          <MessageActions
            role="assistant"
            onRegenerate={onRegenerate}
            onContinue={onContinue}
            onCopy={() => onCopy(translation.text)}
            onTranslate={() => void translation.toggle()}
            translating={translation.loading}
            showingArabic={translation.showing}
            onEdit={() => {
              setDraft(message.content);
              setEditing(true);
            }}
            onReport={onReport}
          />
        ) : null}
      </div>
      {editing ? (
        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-h-32 w-full rounded-2xl border border-border bg-elevated p-4 text-sm outline-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                onEdit(draft);
                setEditing(false);
              }}
            >
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {translation.loading ? (
            <p className="mb-2 text-xs text-subtle">Translating to Arabic…</p>
          ) : null}
          {translation.error ? (
            <p className="mb-2 text-xs text-danger">{translation.error}</p>
          ) : null}
          {translation.showing ? (
            <p className="mb-2 text-xs text-subtle">Translated to Arabic</p>
          ) : null}
          <div dir={translation.showing ? "rtl" : "ltr"} className={translation.showing ? "text-right" : ""}>
            <StoryText content={translation.text} />
          </div>
        </div>
      )}
    </article>
  );
}
