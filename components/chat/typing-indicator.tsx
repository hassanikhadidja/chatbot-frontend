export function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted animate-fade-in" aria-live="polite">
      <span>
        {name} is thinking
        <span className="dot-pulse ml-1 inline-flex gap-0.5">
          <span className="inline-block">.</span>
          <span className="inline-block">.</span>
          <span className="inline-block">.</span>
        </span>
      </span>
    </div>
  );
}
