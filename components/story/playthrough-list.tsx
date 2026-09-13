"use client";

import { Badge } from "@/components/ui/badge";
import type { Playthrough } from "@/lib/types";
import { formatFullDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function PlaythroughList({
  playthroughs,
  activeId,
  onSelect,
}: {
  playthroughs: Playthrough[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="space-y-2">
      {playthroughs
        .slice()
        .sort((a, b) => b.number - a.number)
        .map((playthrough) => {
          const selected = playthrough.id === activeId;
          return (
            <li key={playthrough.id}>
              <button
                type="button"
                onClick={() => onSelect(playthrough.id)}
                className={cn(
                  "flex w-full items-start justify-between rounded-2xl border px-3 py-3 text-left transition",
                  selected ? "border-accent/40 bg-accent-soft" : "border-border hover:bg-elevated",
                )}
              >
                <div>
                  <p className="text-sm font-medium">Playthrough #{playthrough.number}</p>
                  <p className="mt-1 text-xs text-subtle">
                    Started {formatFullDate(playthrough.startedAt)}
                  </p>
                </div>
                <Badge className={playthrough.status === "active" ? "border-accent/30 text-accent" : ""}>
                  {playthrough.status === "active" ? "Active" : "Completed"}
                </Badge>
              </button>
            </li>
          );
        })}
    </ul>
  );
}
