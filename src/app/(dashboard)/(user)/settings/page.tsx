import { SettingsForm } from "@/components/forms/settings-form";
import { PasswordForm } from "@/components/forms/password-form";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) notFound();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      displayUsername: true,
      email: true,
      image: true,
      website: true,
      twitter: true,
      profile: true,
    },
  });
  if (!user) notFound();

  return (
    <div className="container max-w-4xl py-10 mx-auto fade-in">
      <h1 className="text-3xl font-extrabold mb-10 tracking-tight text-primary">
        Account Settings
      </h1>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-6 text-primary">
          Profile Information
        </h2>
        <SettingsForm initialData={user} />
      </section>
      <Separator className="my-10" />
      <section>
        <h2 className="text-xl font-semibold mb-6 text-primary">
          Change Password
        </h2>
        <PasswordForm />
      </section>
    </div>
  );
}
