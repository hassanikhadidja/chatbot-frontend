"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Drawer({
  open,
  onOpenChange,
  title,
  children,
  side = "left",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  side?: "left" | "right" | "bottom";
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-overlay animate-fade-in" />
        <Dialog.Content
          className={cn(
            "fixed z-[61] border-border bg-card shadow-soft animate-fade-up",
            side === "left" && "inset-y-0 left-0 w-[min(88vw,20rem)] border-r",
            side === "right" && "inset-y-0 right-0 w-[min(92vw,24rem)] border-l",
            side === "bottom" && "inset-x-0 bottom-0 max-h-[86vh] rounded-t-3xl border-t",
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <Dialog.Title className="text-sm font-medium">{title}</Dialog.Title>
            <Dialog.Description className="sr-only">{title}</Dialog.Description>
            <Dialog.Close className="rounded-full p-2 text-muted hover:bg-elevated" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <div className="h-[calc(100%-3.25rem)] overflow-y-auto story-scroll">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
