"use server";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DeleteGameDialog } from "@/components/dialog/DeleteGameDialog";

const PAGE_SIZE = 10;

type SearchParams = { [key: string]: string | string[] | undefined };

async function getPageParam(searchParams: SearchParams) {
  const p = searchParams.page;
  if (!p) return 1;
  return Array.isArray(p) ? parseInt(p[0], 10) || 1 : parseInt(p, 10) || 1;
}

export default async function AdminGamesPage({ searchParams }: any) {
  const page = await getPageParam(searchParams || {});
  const skip = (page - 1) * PAGE_SIZE;

  const gamesWithExtra = await prisma.game.findMany({
    select: { id: true, title: true, genre: true, createdAt: true, slug: true },
    orderBy: { createdAt: "desc" },
    skip,
    take: PAGE_SIZE + 1,
  });
  const hasNext = gamesWithExtra.length > PAGE_SIZE;
  const games = gamesWithExtra.slice(0, PAGE_SIZE);

  return (
    <div className="max-w-4xl mx-auto py-8 w-full">
      <h1 className="text-3xl font-bold mb-6">Manage Games</h1>
      <Card>
        <CardHeader>
          <CardTitle>Games List</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Genre</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Created At</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {games.map(game => (
                <tr key={game.id}>
                  <td className="px-4 py-2 font-medium">
                    <Link href={`/game/${game.slug}`} className="hover:underline">{game.title}</Link></td>
                  <td className="px-4 py-2">{game.genre?.name}</td>
                  <td className="px-4 py-2">
                    {new Date(game.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <DeleteGameDialog gameId={game.id} gameTitle={game.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-6">
            <Button asChild variant="outline" size="sm" disabled={page <= 1}>
              <a href={`?page=${page - 1}`}>Previous</a>
            </Button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <Button asChild variant="outline" size="sm" disabled={!hasNext}>
              <a href={`?page=${page + 1}`}>Next</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
