import Image from "next/image";
import { cn } from "@/lib/utils";
import type { StorySetup } from "@/lib/types";

export function StoryCover({
  setup,
  className,
  sizes = "100vw",
  priority = false,
}: {
  setup: StorySetup;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-elevated", className)}>
      <div className={cn("absolute inset-0 bg-linear-to-br", setup.coverTone)} />
      <Image
        src={setup.coverImage}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
    </div>
  );
}
