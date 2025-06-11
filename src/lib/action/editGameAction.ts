"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { CreateGameTextFields } from "../validators/create-game";
import { handleGameVersionUpload } from "./handleGameUploads";

export async function editGameAction(formData: FormData, slug: string) {
  // 1) Check session
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session) {
    return { error: "Unauthorized", status: 401 };
  }

  // 2) Find the game by slug and author
  const game = await prisma.game.findUnique({
    where: { slug },
    include: { tags: true }
  });
  if (!game) {
    return { error: "Game not found", status: 404 };
  }
  if (game.authorId !== session.user.id) {
    return { error: "Forbidden", status: 403 };
  }

  // 3) Pull out textual fields
  const rawTitle = formData.get("title");
  const rawDescription = formData.get("description");
  const rawPrice = formData.get("price");
  const rawStatus = formData.get("status");
  const rawGenreId = formData.get("genreId");
  const rawTagIds = formData.get("tagIds");
  const rawVersion = formData.get("version");
  const rawVersionDescription = formData.get("versionDescription");
  const rawGameType = formData.get("gameType");

  if (!rawTitle || typeof rawTitle !== "string" || rawTitle.trim().length < 8) {
    return { error: "Title is required and must be at least 8 characters.", status: 400 };
  }
  if (!rawGameType || (rawGameType !== "DOWNLOADABLE" && rawGameType !== "HTML")) {
    return { error: "Game type is required and must be DOWNLOADABLE or HTML.", status: 400 };
  }

  let parsedTagIds: string[] | null = null;
  if (typeof rawTagIds === "string") {
    try {
      const arr = JSON.parse(rawTagIds);
      if (Array.isArray(arr) && arr.every((x) => typeof x === "string")) {
        if (arr.length > 10) {
          return { error: "You can select up to 10 tags only.", status: 400 };
        }
        parsedTagIds = arr;
      }
    } catch { }
  }

  let normalizedPrice = 0;
  if (typeof rawPrice === "string" && rawPrice.trim() !== "") {
    normalizedPrice = Math.max(0, Math.round(Number(rawPrice)));
  }

  const safeDescription = typeof rawDescription === "string" ? rawDescription.trim() : null;

  const textFields = {
    title: typeof rawTitle === "string" ? rawTitle : "",
    description: safeDescription && safeDescription !== "" ? safeDescription : null,
    price: normalizedPrice,
    status: typeof rawStatus === "string" ? rawStatus : "DRAFT",
    genreId:
      typeof rawGenreId === "string" && rawGenreId.trim() !== ""
        ? rawGenreId
        : null,
    tagIds: parsedTagIds,
    version:
      typeof rawVersion === "string" && rawVersion.trim() !== ""
        ? rawVersion
        : null,
    versionDescription:
      typeof rawVersionDescription === "string" &&
        rawVersionDescription.trim() !== ""
        ? rawVersionDescription
        : null,
    gameType: rawGameType === "HTML" ? "HTML" : "DOWNLOADABLE",
  };

  const parsed = CreateGameTextFields.safeParse(textFields);
  if (!parsed.success) {
    return {
      error: "Invalid input",
      details: parsed.error.flatten(),
      status: 400
    };
  }

  const {
    title,
    description,
    price,
    status: statusVal,
    genreId,
    tagIds,
    versionDescription,
    gameType,
  } = parsed.data;

  // 4) Handle the cover image upload (if provided)
  let imageUrl: string | null = game.image;
  const maybeImage = formData.get("image");
  if (maybeImage instanceof File && maybeImage.size > 0) {
    const imgName = `${Date.now()}-${maybeImage.name.replace(/\s+/g, "_")}`;
    const imageFolder = path.join(process.cwd(), "public", "uploads", "images");
    await fs.mkdir(imageFolder, { recursive: true });
    const arrayBuffer = await maybeImage.arrayBuffer();
    await fs.writeFile(path.join(imageFolder, imgName), Buffer.from(arrayBuffer));
    imageUrl = `/uploads/images/${imgName}`;
  }

  // 5) Update the Game row
  const updatedGame = await prisma.game.update({
    where: { id: game.id },
    data: {
      title,
      description,
      image: imageUrl,
      price,
      status: statusVal,
      genreId: genreId ?? null,
      gameType,
      updatedAt: new Date(),
    },
  });

  // 6) Update tags (disconnect all, then connect new)
  if (tagIds) {
    await prisma.game.update({
      where: { id: game.id },
      data: {
        tags: {
          deleteMany: {},
          create: tagIds.map((t) => ({ tag: { connect: { id: t } } })),
        },
      },
    });
  }

  // If version is provided, ensure it is unique
  const uploadVersion = `v${Date.now()}`;

  // 7) Handle game version upload (if provided)
  const maybeZip = formData.get("gameFile");
  await handleGameVersionUpload(
    game.id,
    uploadVersion,
    versionDescription ?? '',
    maybeZip as File
  )

  revalidatePath(`/game/${slug}`);
  return { result: updatedGame, status: 200 };
}
