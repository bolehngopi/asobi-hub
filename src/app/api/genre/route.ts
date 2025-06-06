import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const genres = await prisma.genre.findMany({
    select: { id: true, name: true, slug: true, description: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(genres);
}

