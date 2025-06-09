// app/api/game/new/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod/v4";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import unzipper from "unzipper";

// Disable Next.js’s default body parser so we can call request.formData()
export const config = {
  api: {
    bodyParser: false,
  },
};

// You can still use zod for the text fields, but note: 
// we will manually validate them after pulling them from formData().
const CreateGameTextFields = z
  .object({
    title: z.string().min(8),
    description: z.string().optional().nullable(),
    price: z.coerce
      .number()
      .int()
      .min(0, { message: "Price must be an integer ≥ 0" }),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
    genreId: z.string().optional().nullable(),
    tagIds: z.array(z.string()).optional().nullable(),
    version: z.string().optional().nullable(),
    versionDescription: z.string().optional().nullable(),
    gameType: z.enum(["DOWNLOADABLE", "HTML"]), // <-- add gameType
  })
  .strict();

export async function POST(req: Request) {
  // 1) Check session
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Parse the multipart/form-data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (e) {
    console.log("Error parsing form data:", e);
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
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

  // --- Improved: Validate required fields early ---
  if (!rawTitle || typeof rawTitle !== "string" || rawTitle.trim().length < 8) {
    return NextResponse.json({ error: "Title is required and must be at least 8 characters." }, { status: 400 });
  }
  if (!rawGameType || (rawGameType !== "DOWNLOADABLE" && rawGameType !== "HTML")) {
    return NextResponse.json({ error: "Game type is required and must be DOWNLOADABLE or HTML." }, { status: 400 });
  }

  // --- Improved: Tag limit enforcement ---
  let parsedTagIds: string[] | null = null;
  if (typeof rawTagIds === "string") {
    try {
      const arr = JSON.parse(rawTagIds);
      if (Array.isArray(arr) && arr.every((x) => typeof x === "string")) {
        if (arr.length > 10) {
          return NextResponse.json({ error: "You can select up to 10 tags only." }, { status: 400 });
        }
        parsedTagIds = arr;
      }
    } catch {
      // ignore; we’ll let zod validation catch it if needed
    }
  }

  // --- Improved: Price normalization (IDR, no decimals) ---
  let normalizedPrice = 0;
  if (typeof rawPrice === "string" && rawPrice.trim() !== "") {
    normalizedPrice = Math.max(0, Math.round(Number(rawPrice)));
  }

  // --- Improved: Slug generation (unique, readable) ---
  const slugBase =
    (typeof rawTitle === "string"
      ? rawTitle.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "")
      : "game") + `-${Date.now()}`;

  // --- Improved: Markdown sanitization (optional, for security) ---
  // You may want to sanitize markdown here if you render it as HTML on the frontend.
  // For now, just trim.
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

  // Validate with zod
  const parsed = CreateGameTextFields.safeParse(textFields);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid input",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const {
    title,
    description,
    price,
    status,
    genreId,
    tagIds,
    version,
    versionDescription,
    gameType, // <-- add gameType
  } = parsed.data;

  // 4) Handle the cover image upload (if provided)
  let imageUrl: string | null = null;
  const maybeImage = formData.get("image");
  if (maybeImage instanceof File && maybeImage.size > 0) {
    const imgName = `${Date.now()}-${maybeImage.name.replace(/\s+/g, "_")}`;
    const imageFolder = path.join(process.cwd(), "public", "uploads", "images");
    await fs.mkdir(imageFolder, { recursive: true });
    const arrayBuffer = await maybeImage.arrayBuffer();
    await fs.writeFile(path.join(imageFolder, imgName), Buffer.from(arrayBuffer));
    imageUrl = `/uploads/images/${imgName}`;
  }

  // 5) Create the Game row
  const game = await prisma.game.create({
    data: {
      title,
      slug: slugBase,
      description,
      image: imageUrl,
      price,
      status,
      genreId: genreId ?? null,
      tags: tagIds && tagIds.length > 0 ? {
        create: tagIds.map((t) => ({ tag: { connect: { id: t } } }))
      } : undefined,
      authorId: session.user.id,
      updatedAt: new Date(),
      gameType
    },
  });

  // 6) Handle game version upload (if provided)
  const maybeZip = formData.get("gameFile");
  if (version && maybeZip instanceof File && maybeZip.size > 0) {
    const zipName = `${Date.now()}-${maybeZip.name.replace(/\s+/g, "_")}`;
    const zipFolder = path.join(process.cwd(), "public", "uploads", "zips");
    await fs.mkdir(zipFolder, { recursive: true });
    const arrayBuffer2 = await maybeZip.arrayBuffer();
    const savedZipPath = path.join(zipFolder, zipName);
    await fs.writeFile(savedZipPath, Buffer.from(arrayBuffer2));
    const extractDir = path.join(process.cwd(), "public", "uploads", "games", game.id, version);
    await fs.mkdir(extractDir, { recursive: true });
    await fsSync.createReadStream(savedZipPath).pipe(unzipper.Extract({ path: extractDir })).promise();
    const fileUrl = `/uploads/games/${game.id}/${version}/`;
    const size = Math.round(maybeZip.size / 1024 / 1024); // size in MB
    await prisma.gameVersion.create({
      data: {
        gameId: game.id,
        version,
        size,
        description: versionDescription,
        fileUrl,
        updatedAt: new Date(),
      },
    });
  }

  // 7) Return the newly created Game (with relations)
  const result = await prisma.game.findUnique({
    where: { id: game.id },
    include: { tags: true, genre: true, versions: true },
  });

  return NextResponse.json(result, { status: 201 });
}
