import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "All Categories";
  const sort = searchParams.get("sort") ?? "newest";
  const priceMin = parseFloat(searchParams.get("priceMin") ?? "0");
  const priceMax = parseFloat(searchParams.get("priceMax") ?? "100000000");

  const where: any = {
    status: "PUBLISHED",
    title: { contains: search, mode: "insensitive" },
    ...(category !== "All Categories" && {
      genre: { name: category }
    }),
    price: { gte: priceMin, lte: priceMax },
  };

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-low") orderBy = { price: "asc" };
  else if (sort === "price-high") orderBy = { price: "desc" };

  const games = await prisma.game.findMany({
    where: {
      ...where,
      status: "PUBLISHED",
    },
    orderBy,
    include: {
      genre: true,
      tags: { include: { tag: true } },
      author: true,
    },
    take: 36,
  });

  const gameCards = games.map((game: any) => ({
    id: game.id,
    slug: game.slug,
    title: game.title,
    description: game.description || "",
    price: game.price,
    discountPrice: null,
    rating: 5,
    coverImage: game.image || "/placeholder.png",
    categories: [game.genre?.name, ...game.tags.map((t: any) => t.tag.name)].filter(Boolean),
    releaseDate: game.createdAt.toISOString().slice(0, 10),
    author: {...game.author}
  }));

  const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });
  const categories = genres.map((g) => g.name);

  return NextResponse.json({ games: gameCards, categories });
}
