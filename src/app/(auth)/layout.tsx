import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (session) {
    return redirect("/");
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}