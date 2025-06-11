"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { CreateGameTextFields } from "../validators/create-game";
import { handleGameVersionUpload } from "./handleGameUploads";

export async function createGameAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized", status: 401 };

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
    status,
    genreId,
    tagIds,
    gameType,
  } = parsed.data;

  // Generate slug from title
  const slugBase = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  // 3) Handle cover image
  let imageUrl: string | null = null;
  const maybeImage = formData.get("image");
  if (maybeImage instanceof File && maybeImage.size > 0) {
    const imgName = `${Date.now()}-${maybeImage.name.replace(/\s+/g, "_")}`;
    const imageFolder = path.join(process.cwd(), "public", "uploads", "images");
    await fs.mkdir(imageFolder, { recursive: true });
    const buffer = Buffer.from(await maybeImage.arrayBuffer());
    await fs.writeFile(path.join(imageFolder, imgName), buffer);
    imageUrl = `/uploads/images/${imgName}`;
  }

  // 4) Create the Game record
  const game = await prisma.game.create({
    data: {
      title,
      slug: slugBase,
      description,
      image: imageUrl,
      price,
      status,
      genreId: genreId ?? null,
      tags: tagIds?.length
        ? { create: tagIds.map((t) => ({ tag: { connect: { id: t } } })) }
        : undefined,
      authorId: session.user.id,
      gameType,
    },
  });

  // 5) Delegate the ZIP upload (auto-versioned) & extraction
  const maybeZip = formData.get("gameFile") as Blob | null;
  await handleGameVersionUpload(
    game.id,
    null,
    parsed.data.versionDescription ?? null,
    maybeZip
  );

  // 6) Revalidate and return
  revalidatePath("/game");
  return { result: game, status: 201 };
}
