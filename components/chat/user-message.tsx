"use client";

import { useState } from "react";
import { MessageActions } from "@/components/chat/message-actions";
import { Button } from "@/components/ui/button";
import { useArabicTranslation } from "@/lib/hooks/use-arabic-translation";
import type { StoryMessage } from "@/lib/types";
import { formatTime } from "@/lib/utils";

export function UserMessage({
  message,
  showTimestamp,
  onCopy,
  onEdit,
  onDelete,
}: {
  message: StoryMessage;
  showTimestamp?: boolean;
  onCopy: (content: string) => void;
  onEdit: (content: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const translation = useArabicTranslation(message.content);

  return (
    <article className="group flex justify-end animate-fade-up">
      <div className="max-w-[min(100%,36rem)]">
        <div className="flex items-center justify-end gap-2">
          {showTimestamp ? <p className="text-xs text-subtle">{formatTime(message.createdAt)}</p> : null}
          <MessageActions
            role="user"
            onCopy={() => onCopy(translation.text)}
            onTranslate={() => void translation.toggle()}
            translating={translation.loading}
            showingArabic={translation.showing}
            onEdit={() => {
              setDraft(message.content);
              setEditing(true);
            }}
            onDelete={onDelete}
          />
        </div>
        {editing ? (
          <div className="space-y-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="min-h-24 w-full rounded-2xl border border-border bg-elevated p-4 text-sm outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onEdit(draft);
                  setEditing(false);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {translation.loading ? (
              <p className="mb-2 text-right text-xs text-subtle">Translating to Arabic…</p>
            ) : null}
            {translation.error ? (
              <p className="mb-2 text-right text-xs text-danger">{translation.error}</p>
            ) : null}
            <div
              dir={translation.showing ? "rtl" : "ltr"}
              className="rounded-3xl rounded-br-lg bg-user-bubble px-4 py-3 text-[0.98rem] leading-7"
            >
              {translation.text}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
