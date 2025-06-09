import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="container max-w-4xl py-10 mx-auto fade-in">
      <Skeleton className="h-10 w-1/3 mb-10 rounded" />
      <section className="mb-10">
        <Skeleton className="h-7 w-1/4 mb-6 rounded" />
        <div className="flex flex-col gap-6 w-full max-w-2xl">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-24 w-24 rounded-full mb-2" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 w-full">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-24 w-full rounded" />
          </div>
          <Skeleton className="h-10 w-40 mt-4 self-end rounded" />
        </div>
      </section>
      <div className="my-10">
        <Skeleton className="h-1 w-full rounded" />
      </div>
      <section>
        <Skeleton className="h-7 w-1/4 mb-6 rounded" />
        <div className="flex flex-col gap-6 w-full max-w-2xl">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          ))}
          <Skeleton className="h-10 w-40 mt-4 self-end rounded" />
        </div>
      </section>
    </div>
  );
}
