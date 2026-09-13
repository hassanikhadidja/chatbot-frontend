"use client";

import { Square, ArrowUp } from "lucide-react";
import { useRef, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  generating,
  enterToSend,
  placeholder = "Say or do something…",
  disabled,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  generating?: boolean;
  enterToSend?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter") return;
    if (event.shiftKey || !enterToSend) return;
    event.preventDefault();
    if (value.trim()) onSend();
  }

  return (
    <div className={cn("border-t border-border bg-background/90 p-3 backdrop-blur-md md:p-4", className)}>
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-[1.6rem] border border-border bg-elevated px-3 py-2">
        <textarea
          ref={ref}
          value={value}
          rows={1}
          disabled={disabled}
          onChange={(event) => {
            onChange(event.target.value);
            const el = event.target;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "max-h-44 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-sm leading-6 outline-none placeholder:text-subtle",
          )}
          aria-label={placeholder}
        />
        {generating ? (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label="Stop generation"
            onClick={onStop}
          >
            <Square className="size-3.5 fill-current" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            aria-label="Send message"
            disabled={!value.trim() || disabled}
            onClick={onSend}
          >
            <ArrowUp className="size-4" />
          </Button>
        )}
      </div>
      <p className="mx-auto mt-2 max-w-3xl px-1 text-xs text-subtle">
        Enter to send · Shift + Enter for a new line
      </p>
    </div>
  );
}
