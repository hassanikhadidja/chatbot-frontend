import type { ReactNode } from "react";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*[^*]+\*|“[^”]+”|"[^"]+")/g);
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={key} className="text-muted">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (
      (part.startsWith("“") && part.endsWith("”")) ||
      (part.startsWith('"') && part.endsWith('"') && part.length > 1)
    ) {
      return (
        <span key={key} className="text-foreground italic">
          {part}
        </span>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

export function StoryText({ content }: { content: string }) {
  const paragraphs = content.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="story-prose max-w-2xl text-[1.05rem] leading-8 text-ai-ink">
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{renderInline(paragraph, `p${index}`)}</p>
      ))}
    </div>
  );
}
