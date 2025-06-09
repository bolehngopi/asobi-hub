"use server";
import { toast } from "sonner";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";

export async function deleteGameAction(formData: FormData) {
  const gameId = formData.get("gameId") as string;
  try {
    await prisma.game.delete({ where: { id: gameId } });
    toast.success("Game deleted successfully");
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete game");
  }
  revalidatePath("/admin/games");
}