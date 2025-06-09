import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function AdminDashboardPage() {
  // Fetch stats using Prisma ORM
  const [userCount, gameCount, salesSum, recentUsers, recentGames, recentOrders] = await Promise.all([
    prisma.user.count(),
    prisma.game.count(),
    prisma.transaction.aggregate({
      _sum: { totalAmount: true },
    }).then(res => res._sum?.totalAmount ?? 0),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, createdAt: true } }),
    prisma.game.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, title: true, createdAt: true } }),
    prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { createdAt: true, id: true, totalAmount: true } }),
  ]);

  type Activity = { id: string; label: string; date: Date };

  const activities: Activity[] = [
    ...recentUsers.map(u => ({
      id: `user-${u.id}`,
      label: `User ${u.name} registered`,
      date: u.createdAt,
    })),
    ...recentGames.map(g => ({
      id: `game-${g.id}`,
      label: `Game ${g.title} added`,
      date: g.createdAt,
    })),
    ...recentOrders.map(o => ({
      id: `order-${o.id}`,
      label: `Order #${o.id} completed ($${o.totalAmount.toFixed(2)})`,
      date: o.createdAt,
    })),
  ]
    // 3. Sort descending
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-8">
        <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-lg mb-8">Welcome, Admin! Here are your latest stats and actions.</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold">{userCount}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Games</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold">{gameCount}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold">${salesSum.toLocaleString()}</span>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recentUsers.map(u => (
                  <li key={`u-${u.id}`}>User <span className="font-semibold">{u.name}</span> registered ({new Date(u.createdAt).toLocaleString()}).</li>
                ))}
                {recentGames.map(g => (
                  <li key={`g-${g.id}`}>Game <span className="font-semibold">{g.title}</span> added ({new Date(g.createdAt).toLocaleString()}).</li>
                ))}
                {recentOrders.map(o => (
                  <li key={`o-${o.id}`}>Order #<span className="font-semibold">{o.id}</span> completed (${o.totalAmount.toFixed(2)}) ({new Date(o.createdAt).toLocaleString()}).</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-3">
                <Button asChild variant="default">
                  <Link href="/admin/users">Manage Users</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/admin/games">Manage Games</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/admin/marketplace">Marketplace Settings</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}