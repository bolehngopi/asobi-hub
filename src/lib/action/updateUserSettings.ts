"use server";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { authClient } from "../auth-client";
import path from "path";
import { writeFile } from "fs/promises";
import { nanoid } from "nanoid";

const uploadDir = path.join(process.cwd(), "public", "uploads");

export async function updateUserSettings(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Not authenticated");

  const update: any = {
    name: formData.get("name"),
    username: formData.get("username"),
    displayUsername: formData.get("displayUsername"),
    website: formData.get("website"),
    twitter: formData.get("twitter"),
    profile: formData.get("profile"),
  };

  // Handle image upload (if any)
  const imageFile = formData.get("image");
  if (imageFile && typeof imageFile === "object" && "arrayBuffer" in imageFile) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    const ext = (imageFile as File).name.split(".").pop() || "jpg"; // default fallback ext
    const filename = `${nanoid(4)}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/${filename}`;
    update.image = imageUrl; // Save image URL in database
  }

  await authClient.updateUser({
    id: session.user.id,
    ...update,
  })
  revalidatePath("/dashboard/(user)/settings");
}
