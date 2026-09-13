import { StoryWorkspace } from "@/components/story/story-workspace";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="h-full">
      <StoryWorkspace id={id} />
    </div>
  );
}
