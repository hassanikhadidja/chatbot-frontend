"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function RestartStoryDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Restart this story?"
      description="Your current playthrough will be kept, and a new playthrough will begin from the original story setup."
    >
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={loading}>
          Restart Story
        </Button>
      </div>
    </Modal>
  );
}
