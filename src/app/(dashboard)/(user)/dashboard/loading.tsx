import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="container max-w-4xl py-10 mx-auto fade-in">
      <Skeleton className="h-10 w-1/3 mb-10 rounded" />
      <div className="grid gap-8 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <section key={i} className="flex flex-col gap-6 w-full">
            <Skeleton className="h-7 w-1/2 mb-6 rounded" />
            {[...Array(4)].map((_, j) => (
              <div key={j} className="flex flex-col gap-2">
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
            ))}
            <Skeleton className="h-10 w-32 mt-4 self-end rounded" />
          </section>
        ))}
      </div>
    </div>
  );
}
