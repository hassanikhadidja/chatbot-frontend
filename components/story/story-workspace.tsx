"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen, Users } from "lucide-react";
import { ChatContainer } from "@/components/chat/chat-container";
import { RestartStoryDialog } from "@/components/story/restart-story-dialog";
import { StoryHeader } from "@/components/story/story-header";
import { StoryInfoPanel } from "@/components/story/story-info-panel";
import { StorySidebar } from "@/components/story/story-sidebar";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useStories } from "@/context/stories-context";
import { useUI } from "@/context/ui-context";
import { getActivePlaythrough } from "@/lib/api/stories";

export function StoryWorkspace({ id }: { id: string }) {
  const router = useRouter();
  const { getStory, restartStory, setActivePlaythrough, renameStory, deleteStory, toggleFavorite } = useStories();
  const { toast } = useUI();
  const story = getStory(id);
  const [infoOpen, setInfoOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(story?.setup.title ?? "");
  const [busy, setBusy] = useState(false);

  if (!story) {
    return (
      <EmptyState
        title="This story could not be found."
        description="It may have been deleted, or the link is no longer valid."
        action={
          <Button onClick={() => router.push("/stories")}>Back to My Stories</Button>
        }
      />
    );
  }

  const playthrough = getActivePlaythrough(story);

  return (
    <div className="flex h-full min-h-0">
      <Drawer open={memoryOpen} onOpenChange={setMemoryOpen} title="Inside the story" side="left">
        <StorySidebar story={story} framed={false} />
      </Drawer>
      <StorySidebar story={story} />
      <section className="flex min-w-0 flex-1 flex-col">
        <StoryHeader
          story={story}
          onInfo={() => setInfoOpen(true)}
          onRestart={() => setRestartOpen(true)}
          onRename={() => {
            setTitle(story.setup.title);
            setRenameOpen(true);
          }}
          onFavorite={async () => {
            await toggleFavorite(story.id);
            toast(story.favorited ? "Removed from favoris" : "Added to favoris");
          }}
          onDelete={() => setDeleteOpen(true)}
        />
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2 xl:hidden">
          <Button variant="ghost" size="sm" onClick={() => setMemoryOpen(true)}>
            <BookOpen className="size-4" />
            Chapters
          </Button>
          <p className="text-xs text-subtle">Playthrough #{playthrough.number}</p>
          <Button variant="ghost" size="sm" onClick={() => setInfoOpen(true)}>
            <Users className="size-4" />
            Info
          </Button>
        </div>
        <ChatContainer story={story} />
      </section>
      <aside className="hidden w-[22rem] shrink-0 overflow-y-auto border-l border-border bg-card/50 story-scroll xl:block">
        <StoryInfoPanel
          story={story}
          onSelectPlaythrough={(playthroughId) => {
            void setActivePlaythrough(story.id, playthroughId);
          }}
        />
      </aside>
      <Drawer open={infoOpen} onOpenChange={setInfoOpen} title="Story information" side="right">
        <StoryInfoPanel
          story={story}
          onSelectPlaythrough={(playthroughId) => {
            void setActivePlaythrough(story.id, playthroughId);
            setInfoOpen(false);
          }}
        />
      </Drawer>
      <RestartStoryDialog
        open={restartOpen}
        onOpenChange={setRestartOpen}
        loading={busy}
        onConfirm={async () => {
          setBusy(true);
          try {
            await restartStory(story.id);
            setRestartOpen(false);
            toast("New playthrough started");
          } finally {
            setBusy(false);
          }
        }}
      />
      <Modal
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename story"
        description="This changes the title, not the world underneath it."
      >
        <Input value={title} onChange={(event) => setTitle(event.target.value)} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setRenameOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await renameStory(story.id, title);
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
              await deleteStory(story.id);
              router.push("/stories");
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
