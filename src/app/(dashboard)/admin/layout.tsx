import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // Check if the user is authenticated and has admin role
  const checkIsAdmin = await auth.api.userHasPermission({
    body: {
      role: 'admin',
      permissions: { user: ['create', 'list', 'ban'] }
    }
  })

  console.log(checkIsAdmin);


  if (!session || !checkIsAdmin.success) {
    return redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r flex flex-col py-8 px-4 min-h-screen shadow-sm">
        <h2 className="text-2xl font-bold mb-8">Admin Dashboard</h2>
        <nav className="flex flex-col gap-2">
          <Button asChild variant="ghost" className="justify-start">
            <Link href="/admin">Dashboard</Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start">
            <Link href="/admin/users">Users</Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start">
            <Link href="/admin/games">Games</Link>
          </Button>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}