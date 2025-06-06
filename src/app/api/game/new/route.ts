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

  // Convert tagIds from JSON string → string[]
  let parsedTagIds: string[] | null = null;
  if (typeof rawTagIds === "string") {
    try {
      const arr = JSON.parse(rawTagIds);
      if (Array.isArray(arr) && arr.every((x) => typeof x === "string")) {
        parsedTagIds = arr;
      }
    } catch {
      // ignore; we’ll let zod validation catch it if needed
    }
  }

  const textFields = {
    title: typeof rawTitle === "string" ? rawTitle : "",
    description:
      typeof rawDescription === "string" && rawDescription.trim() !== ""
        ? rawDescription
        : null,
    price:
      typeof rawPrice === "string" && rawPrice.trim() !== ""
        ? Number(rawPrice)
        : 0,
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
  } = parsed.data;

  // 4) Handle the cover image upload (if provided)
  //    We expect a FormData entry named "image"
  let imageUrl: string | null = null;
  const maybeImage = formData.get("image");
  if (maybeImage instanceof File && maybeImage.size > 0) {
    // Build a safe filename: e.g. timestamp-originalname
    const imgName = `${Date.now()}-${maybeImage.name.replace(
      /\s+/g,
      "_"
    )}`;
    // Destination folder under /public/uploads/images/
    const imageFolder = path.join(process.cwd(), "public", "uploads", "images");
    await fs.mkdir(imageFolder, { recursive: true });

    // Write file to disk
    const arrayBuffer = await maybeImage.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const destImagePath = path.join(imageFolder, imgName);
    await fs.writeFile(destImagePath, buffer);

    // Public‐facing URL:
    imageUrl = `/uploads/images/${imgName}`;
  }

  // 5) Create the Game row FIRST (without version) so we get game.id
  //    We still attach imageUrl (if any) and connect tags/genre in one go.
  //    We generate a slug from title + timestamp.
  const slugBase =
    title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "") + `-${Date.now()}`;

  const game = await prisma.game.create({
    data: {
      title,
      slug: slugBase,
      description,
      image: imageUrl,
      price,
      status,
      genreId: genreId ?? null,
      tags:
        tagIds && tagIds.length > 0
          ? {
              create: tagIds.map((t) => ({
                tag: {
                  connect: { id: t },
                },
              })),
            }
          : undefined,
      authorId: session.user.id,
      updatedAt: new Date(),
    },
  });

  // 6) If the user provided BOTH version && gameFile, process that now:
  //    - Save the ZIP under /public/uploads/zips/
  //    - Extract it into /public/uploads/games/{game.id}/{version}/
  //    - Create a GameVersion record with fileUrl = `/uploads/games/{game.id}/{version}/`
  const maybeZip = formData.get("gameFile");
  if (version && maybeZip instanceof File && maybeZip.size > 0) {
    const zipName = `${Date.now()}-${maybeZip.name.replace(/\s+/g, "_")}`;
    const zipFolder = path.join(process.cwd(), "public", "uploads", "zips");
    await fs.mkdir(zipFolder, { recursive: true });

    const arrayBuffer2 = await maybeZip.arrayBuffer();
    const buffer2 = Buffer.from(arrayBuffer2);
    const savedZipPath = path.join(zipFolder, zipName);
    await fs.writeFile(savedZipPath, buffer2);

    // Now extract the ZIP into public/uploads/games/{game.id}/{version}/
    const extractDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "games",
      game.id,
      version
    );
    await fs.mkdir(extractDir, { recursive: true });
    // Use unzipper to extract
    await fsSync
      .createReadStream(savedZipPath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .promise();

    // fileUrl should point at the folder (relative to /public)
    const fileUrl = `/uploads/games/${game.id}/${version}/`;

    // Create the GameVersion row in Prisma
    await prisma.gameVersion.create({
      data: {
        gameId: game.id,
        version,
        description: versionDescription,
        fileUrl,
        updatedAt: new Date(),
      },
    });
  }

  // 7) Return the newly created Game (and optionally the version if you want)
  //    We’ll just return the game record for now. If you want to include versions,
  //    you can fetch them with “include: { versions: true }”.
  const result = await prisma.game.findUnique({
    where: { id: game.id },
    include: { tags: true, genre: true, versions: true },
  });

  return NextResponse.json(result, { status: 201 });
}
