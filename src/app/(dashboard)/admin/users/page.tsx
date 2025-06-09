'use server';
import { revalidatePath } from "next/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { authClient } from "@/lib/auth-client";
import { BanUserDialog } from "@/components/dialog/BanUserDialog";
import { UnbanUserDialog } from "@/components/dialog/UnbanUserDialog";

const PAGE_SIZE = 10;

type SearchParams = { [key: string]: string | string[] | undefined };

function getPageParam(searchParams: SearchParams): number {
  const raw = searchParams.page;
  if (!raw) return 1;
  const val = Array.isArray(raw) ? raw[0] : raw;
  const n = parseInt(val || "1", 10);
  return isNaN(n) || n < 1 ? 1 : n;
}

export async function banUserAction(formData: FormData) {
  const userId = formData.get("userId") as string;
  const banReason = (formData.get("banReason") as string) || "";
  const banExpiresIn = formData.get("banExpiresIn") as string;
  const expires = banExpiresIn ? parseInt(banExpiresIn, 10) : undefined;

  await authClient.admin.banUser({ userId, banReason, banExpiresIn: expires });
  revalidatePath("/admin/users");
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const page = getPageParam(searchParams || {});
  const skip = (page - 1) * PAGE_SIZE;

  // Fetch one extra to detect next page without count()
  const usersWithExtra = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, banned: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    skip,
    take: PAGE_SIZE + 1,
  });

  const hasNext = usersWithExtra.length > PAGE_SIZE;
  const users = usersWithExtra.slice(0, PAGE_SIZE);

  return (
    <div className="max-w-4xl mx-auto py-8 w-full">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-2 font-medium">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.role || "User"}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      {user.banned ? (
                        <UnbanUserDialog user={user} />
                      ) : (
                        <BanUserDialog user={user} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6">
            <Button asChild variant="outline" size="sm" disabled={page <= 1}>
              <a href={`?page=${page - 1}`}>Previous</a>
            </Button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <Button asChild variant="outline" size="sm" disabled={!hasNext}>
              <a href={`?page=${page + 1}`}>Next</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
