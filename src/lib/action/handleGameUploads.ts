"use server";

import prisma from "@/lib/prisma";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import unzipper from "unzipper";

export async function handleGameVersionUpload(
  gameId: string,
  rawVersion: string | null,
  versionDescription: string | null,
  maybeZip: Blob | null
) {
  console.log("↪️ handleGameVersionUpload", { rawVersion, size: maybeZip?.size });

  // pick a version: either what you passed in, or a timestamp fallback
  const version = (typeof rawVersion === "string" && rawVersion.trim())
    ? rawVersion.trim()
    : `v${Date.now()}`;

  if (
    !maybeZip ||
    typeof maybeZip.arrayBuffer !== "function" ||
    maybeZip.size === 0
  ) {
    console.log("🚫 skipping upload: no valid zip", { version });
    return;
  }

  // synthesize a file name for the zip
  const originalName =
    maybeZip instanceof File
      ? maybeZip.name.replace(/\s+/g, "_")
      : `upload-${Date.now()}.zip`;
  const zipName = `${Date.now()}-${originalName}`;

  // 1) write the zip to disk
  const zipFolder = path.join(process.cwd(), "public", "uploads", "zips");
  await fs.mkdir(zipFolder, { recursive: true });
  const buffer = Buffer.from(await maybeZip.arrayBuffer());
  const savedZipPath = path.join(zipFolder, zipName);
  await fs.writeFile(savedZipPath, buffer);

  // 2) extract the zip into the versioned game folder
  const extractDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "games",
    gameId,
    version
  );
  await fs.mkdir(extractDir, { recursive: true });
  await fsSync
    .createReadStream(savedZipPath)
    .pipe(unzipper.Extract({ path: extractDir }))
    .promise();

  // 3) upsert the GameVersion row
  const fileUrl = `/uploads/games/${gameId}/${version}/`;
  const sizeMb = Math.round(maybeZip.size / 1024 / 1024);
  await prisma.gameVersion.upsert({
    where: {
      gameId_version_unique: { gameId, version },
    },
    update: { size: sizeMb, description: versionDescription, fileUrl },
    create: { gameId, version, size: sizeMb, description: versionDescription, fileUrl },
  });

  console.log(`✅ Uploaded & extracted version "${version}" to ${extractDir}`);
}
