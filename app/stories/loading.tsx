import { Skeleton } from "@/components/ui/skeleton";

export default function StoriesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <Skeleton className="h-12 w-56" />
      <Skeleton className="mt-3 h-5 w-72" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-96" />
        ))}
      </div>
    </div>
  );
}
