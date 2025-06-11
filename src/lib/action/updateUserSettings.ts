"use server";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { authClient } from "../auth-client";

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

  await authClient.updateUser({
    id: session.user.id,
    ...update,
  })
  revalidatePath("/dashboard/(user)/settings");
}
