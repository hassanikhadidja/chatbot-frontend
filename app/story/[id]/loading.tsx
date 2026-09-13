import { Skeleton } from "@/components/ui/skeleton";

export default function StoryLoading() {
  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-32 w-2/3" />
    </div>
  );
}
