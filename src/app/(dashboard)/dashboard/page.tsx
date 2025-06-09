import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard | AsobiHub",
  description:
    "Manage your games, view stats, and create new projects on your AsobiHub dashboard.",
};

async function deleteGame(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await prisma.game.delete({ where: { id } });
  revalidatePath("/dashboard");
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return redirect("/login?redirect=/dashboard");
  }

  // Fetch games for the logged-in user, including genre and tags
  const games = await prisma.game.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { username: true, image: true, createdAt: true },
      },
      genre: true,
      tags: { include: { tag: true } },
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 container mx-auto px-4 py-8 max-w-7xl">
      {/* Left: Game List */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Your Projects</h1>
          <Button asChild size="sm">
            <Link href="/game/new">+ New Project</Link>
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          {games.length === 0 ? (
            <Card>
              <CardContent className="text-center text-muted-foreground py-8">
                No games found.
              </CardContent>
            </Card>
          ) : (
            games.map((game) => {
              const rating = (game as any).stars ?? 0;
              return (
                <Card
                  key={game.id}
                  className="flex flex-row items-center gap-4 p-4 hover:shadow-lg transition-shadow group"
                >
                  <div className="w-24 h-16 bg-muted flex items-center justify-center rounded overflow-hidden border">
                    {game.image ? (
                      <img
                        src={game.image}
                        alt={game.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No Image
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-lg">
                      {game.title}
                    </div>
                    <div className="flex gap-2 mt-1 items-center">
                      <span
                        className={`text-xs rounded px-2 py-0.5 ${game.status === 'PUBLISHED'
                          ? "bg-green-700/80 text-white"
                          : game.status === 'ARCHIVED'
                            ? "bg-yellow-600/80 text-white"
                            : "bg-gray-400/80 text-white"
                          }`}
                      >
                        {game.status === 'PUBLISHED'
                          ? "Published"
                          : game.status === 'ARCHIVED'
                            ? "Archived"
                            : "Draft"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {game.genre?.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {rating}★
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-1">
                      {game.description?.slice(0, 60) || "No description."}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end min-w-[70px]">
                    <Link
                      href={`/game/${game.slug}/edit`}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/game/${game.slug}`}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      View
                    </Link>
                    <form action={deleteGame}>
                      <input type="hidden" name="id" value={game.id} />
                      <Button
                        type="submit"
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 mt-1"
                        title="Delete game"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
      {/* Right: Summary/Stats */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="pb-2 border-b">
            <div className="font-semibold text-lg">Summary</div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span>Views</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Downloads</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Followers</span>
                <span className="font-bold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Placeholder for recent activity or analytics */}
        <Card>
          <CardHeader className="pb-2 border-b">
            <div className="font-semibold text-lg">Recently updated</div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              No recent activity.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}