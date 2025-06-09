import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { Home, ReceiptIcon, Settings } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r flex flex-col py-8 px-4 min-h-screen shadow-sm">
        <h2 className="text-2xl font-bold mb-8">Welcome back, {session.user.name}!</h2>
        <nav className="flex flex-col gap-2">
          <Button asChild variant="ghost" className="justify-start gap-2">
            <Link href="/dashboard">
              <span className="inline-flex items-center">
                <Home className="mr-2" />
                Dashboard
              </span>
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start gap-2">
            <Link href="/dashboard/transactions">
              <span className="inline-flex items-center">
                <ReceiptIcon className="mr-2" />
                Transactions
              </span>
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start gap-2">
            <Link href="/settings">
              <span className="inline-flex items-center">
                <Settings className="mr-2" />
                Settings
              </span>
            </Link>
          </Button>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}