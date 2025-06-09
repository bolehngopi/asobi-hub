import GameForm from "@/components/forms/game-form";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function EditGamePage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { slug } = await params;
  // Fetch game data from the database using Prisma
  const game = await prisma.game.findUnique({
    where: { slug },
    include: { tags: true, genre: true },
  });
  if (!game) return notFound();

  if (session?.user?.id !== game.authorId) {
    return notFound();
  }

  // Transform tags to match the expected initialData shape
  const initialData = {
    ...game,
    tags: game.tags?.map((t: { tagId?: string; id?: string; [key: string]: any }) => ({ tagId: t.tagId ?? t.id, ...t })),
  };

  return (
    <div className="flex h-full w-full items-center justify-center container py-10 mx-auto">
      <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
        <h1 className="text-3xl font-bold">Editing {game.title}</h1>
        <GameForm initialData={initialData} />
        <p className="text-gray-600">
          You can always return to add more versions or update metadata later!
        </p>
      </div>
    </div>
  );
}

