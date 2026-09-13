import { cn } from "@/lib/utils";

export function Avatar({
  name,
  hue,
  size = "md",
  className,
}: {
  name: string;
  hue?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white",
        size === "sm" && "size-8 text-xs",
        size === "md" && "size-10 text-sm",
        size === "lg" && "size-12 text-base",
        size === "xl" && "size-16 text-lg",
        className,
      )}
      style={{
        background: `linear-gradient(145deg, hsl(${hue ?? 32} 28% 28%), hsl(${hue ?? 32} 40% 16%))`,
      }}
    >
      {initials}
    </span>
  );
}
