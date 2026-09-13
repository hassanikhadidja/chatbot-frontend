"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RestartStoryDialog } from "@/components/story/restart-story-dialog";
import { StoryInfoPanel } from "@/components/story/story-info-panel";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useStories } from "@/context/stories-context";
import { useUI } from "@/context/ui-context";
import type { Story } from "@/lib/types";

export function useStoryActions() {
  const router = useRouter();
  const { restartStory, renameStory, deleteStory, toggleFavorite, setActivePlaythrough } = useStories();
  const { toast } = useUI();
  const [target, setTarget] = useState<Story | null>(null);
  const [restartOpen, setRestartOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  return {
    continueStory: (story: Story) => router.push(`/story/${story.id}`),
    restart: (story: Story) => {
      setTarget(story);
      setRestartOpen(true);
    },
    rename: (story: Story) => {
      setTarget(story);
      setTitle(story.setup.title);
      setRenameOpen(true);
    },
    info: (story: Story) => {
      setTarget(story);
      setInfoOpen(true);
    },
    favorite: async (story: Story) => {
      await toggleFavorite(story.id);
      toast(story.favorited ? "Removed from favoris" : "Added to favoris");
    },
    remove: (story: Story) => {
      setTarget(story);
      setDeleteOpen(true);
    },
    dialogs: (
      <>
        <RestartStoryDialog
          open={restartOpen}
          onOpenChange={setRestartOpen}
          loading={busy}
          onConfirm={async () => {
            if (!target) return;
            setBusy(true);
            try {
              await restartStory(target.id);
              setRestartOpen(false);
              toast("New playthrough started");
              router.push(`/story/${target.id}`);
            } finally {
              setBusy(false);
            }
          }}
        />
        <Modal
          open={renameOpen}
          onOpenChange={setRenameOpen}
          title="Rename story"
          description="Give this world a name you will recognize later."
        >
          <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!target) return;
                await renameStory(target.id, title);
                setRenameOpen(false);
              }}
            >
              Save
            </Button>
          </div>
        </Modal>
        <Modal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete this story?"
          description="The concept, playthroughs, and conversation will be removed from this device."
        >
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (!target) return;
                await deleteStory(target.id);
                setDeleteOpen(false);
              }}
            >
              Delete
            </Button>
          </div>
        </Modal>
        {target ? (
          <Drawer open={infoOpen} onOpenChange={setInfoOpen} title="Story information" side="right">
            <StoryInfoPanel
              story={target}
              onSelectPlaythrough={async (playthroughId) => {
                await setActivePlaythrough(target.id, playthroughId);
                setInfoOpen(false);
                router.push(`/story/${target.id}`);
              }}
            />
          </Drawer>
        ) : null}
      </>
    ),
  };
}
