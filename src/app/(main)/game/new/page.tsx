import { redirect } from "next/navigation";
import { toast } from "sonner";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import GameForm from "@/components/forms/game-form";

export default async function CreateGamePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    toast.error("You must be logged in to create a game.");
    redirect("/login?redirect=/game/new");
  }

  return (
    <div className="flex h-full w-full items-center justify-center container py-10 mx-auto">
      <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
        <h1 className="text-3xl font-bold">Create a New Game</h1>
        <GameForm />
        <p className="text-gray-600">
          You can always return to add more versions or update metadata later!
        </p>
      </div>
    </div>
  );
}
