"use server";
import { revalidatePath } from "next/cache";
import { authClient } from "@/lib/auth-client";

export async function banUserAction(formData: FormData) {
  const userId = formData.get("userId") as string;
  const banReason = (formData.get("banReason") as string) || "";
  const banExpiresIn = formData.get("banExpiresIn") as string;
  const expires = banExpiresIn ? parseInt(banExpiresIn, 10) : undefined;

  await authClient.admin.banUser({ userId, banReason, banExpiresIn: expires });
  revalidatePath("/admin/users");
}
