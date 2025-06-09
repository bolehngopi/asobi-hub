import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { formatter } from "@/lib/format";
import GameCartButton from "@/components/page/game-cart-button";
import { TransactionStatus } from "@/generated/prisma/enums";

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  // Fetch game and check cart in parallel for performance
  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      author: true,
      versions: { orderBy: { createdAt: "desc" }, take: 1 },
      genre: true,
      tags: { include: { tag: true } },
    },
  });

  if (!game) return notFound();
  if (game.status !== "PUBLISHED" && (!session || !session.user || session.user.id !== game.authorId)) {
    return notFound();
  }
  
  const latestVersion = game.versions[0];

  return (
    <div className="container py-10 mx-auto px-2 fade-in max-w-3xl">
      {/* Two-column layout: Description | Thumbnail */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Description column */}
        <div className="md:w-2/3 w-full">
          <h1 className="text-2xl font-bold mb-2">{game.title}</h1>
          <div className="text-muted-foreground text-sm mb-2">
            <Link href={`/user/${game.author?.username}`} className="hover:underline">
              {game.author?.displayUsername || game.author?.username}
            </Link>
            {game.genre && (
              <span className="ml-2 text-xs bg-primary/10 px-2 py-1 rounded">{game.genre.name}</span>
            )}
          </div>
          <div className="prose dark:prose-invert max-w-none mb-4">
            {game.description ? (
              <ReactMarkdown>{game.description}</ReactMarkdown>
            ) : (
              <span className="text-muted-foreground italic">No description provided.</span>
            )}
          </div>
          {/* Info dropdown */}
          <details className="mb-4 bg-muted/30 rounded border p-3">
            <summary className="cursor-pointer font-semibold">More Information</summary>
            <div className="mt-2 text-xs text-muted-foreground space-y-1">
              <div><b>Status:</b> {game.status === "PUBLISHED" ? "Released" : game.status}</div>
              <div><b>Updated:</b> {game.updatedAt.toLocaleDateString()}</div>
              <div><b>Published:</b> {game.createdAt.toLocaleDateString()}</div>
              <div><b>Category:</b> {game.gameType === "HTML" ? "HTML Game" : "Downloadable"}</div>
              {game.genre && (
                <div>
                  <b>Genre:</b> <Link href={`/marketplace?genre=${encodeURIComponent(game.genre.slug)}`} className="underline hover:text-primary">{game.genre.name}</Link>
                </div>
              )}
              {Array.isArray(game.tags) && game.tags.length > 0 && (
                <div>
                  <b>Tags:</b> {game.tags.map((tag: any, i: number) => (
                    <Link key={tag.tag?.slug || tag.slug || i} href={`/marketplace?tag=${encodeURIComponent(tag.tag?.slug || tag.slug)}`} className="underline hover:text-primary mr-1">
                      {tag.tag?.name || tag.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </details>
          {/* Download/Purchase Section */}
          {game.price === 0 ? (
            <div>
              <h2 className="text-lg font-bold mb-2">Download</h2>
              {game.versions.length > 0 ? (
                <div className="space-y-3">
                  {game.versions.map((version) => (
                    <div key={version.id} className="flex flex-col md:flex-row md:items-center md:justify-between border rounded p-3 bg-background/80">
                      <div>
                        <div className="font-medium">
                          <a href={version.fileUrl} download target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {version.fileUrl.split('/').pop()}
                          </a>
                          {/* If you want to show file size, you must store it in the GameVersion model. If not present, remove this. */}
                          {version.size && (
                            <span className="ml-2 text-xs text-muted-foreground">{version.size} MB</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{version.description || "No version notes."}</div>
                      </div>
                      <Button asChild variant="secondary" className="mt-2 md:mt-0 md:ml-4 w-fit">
                        <a href={version.fileUrl} download target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">No downloadable versions available.</span>
              )}
            </div>
          ) : (
            <div className="bg-background/80 border rounded p-4 mt-4">
              <h2 className="text-lg font-bold mb-2">Purchase</h2>
              <div className="flex items-center gap-4 mb-2">
                {/* Add to Cart button logic (client component) */}
                <GameCartButton game={game} session={session} />
                <span className="text-xl font-semibold">{formatter.format(game.price)}</span>
              </div>
              <div className="mb-2 text-sm">
                In order to download this game you must purchase it at or above the minimum price of <b>{formatter.format(game.price)}</b>. You will get access to the following files:
              </div>
              {game.versions.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {game.versions.map((version) => (
                    <div key={version.id} className="font-medium flex items-center gap-2">
                      <span>{version.fileUrl.split('/').pop()}</span>
                      {/* If you want to show file size, you must store it in the GameVersion model. If not present, remove this. */}
                      {version.size && (
                        <span className="text-xs text-muted-foreground">{version.size} MB</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">No downloadable versions available.</span>
              )}
            </div>
          )}
        </div>
        {/* Thumbnail column */}
        <div className="md:w-1/3 w-full flex flex-col items-center">
          {game.image && (
            <div className="relative w-full aspect-[4/3] rounded overflow-hidden border bg-muted max-w-xs">
              <Image src={game.image} alt={game.title} fill className="object-cover" />
            </div>
          )}
        </div>
      </div>
      {/* Game play/embed section for HTML games */}
      {game.gameType === "HTML" && latestVersion?.fileUrl && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-2">Play Online</h2>
          <div className="aspect-video w-full rounded overflow-hidden border bg-black">
            <iframe
              src={latestVersion.fileUrl}
              title={game.title}
              className="w-full h-full min-h-[400px]"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Fetch game for metadata
  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      author: true,
      genre: true,
      versions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!game) return {};

  const imageUrl = game.image || "/file.svg";
  const description =
    game.description?.replace(/[\r\n]+/g, " ").slice(0, 160) ||
    `Play ${game.title} by ${game.author?.displayUsername || game.author?.username} on AsobiHub.`;

  return {
    title: `${game.title}`,
    description,
    openGraph: {
      title: `${game.title}`,
      description,
      url: `https://asobi-hub.vercel.app/game/${slug}`,
      type: "website",
      siteName: "AsobiHub",
      images: [
        {
          url: imageUrl,
          width: 600,
          height: 400,
          alt: `${game.title} cover image`,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${game.title}`,
      description,
      site: "@asobihub",
      creator: "@asobihub",
      images: [imageUrl],
    },
    alternates: {
      canonical: `/game/${slug}`,
    },
  };
}