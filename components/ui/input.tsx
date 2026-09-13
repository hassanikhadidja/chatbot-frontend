import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-full border border-border bg-elevated px-4 text-sm text-foreground placeholder:text-subtle outline-none transition focus:border-accent/50",
        className,
      )}
      {...props}
    />
  );
}
