import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Gamepad2, ShoppingCart, User, Play } from "lucide-react";
import prisma from "@/lib/prisma";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type RecentGame = {
  id: string;
  title: string;
  image: string | null;
};

type Achievement = {
  id: string;
  title: string;
  icon?: string;
  rarity?: string;
  game?: string;
  date?: string;
  points?: number;
};

type Purchase = {
  id: string;
  game?: string;
  date?: string;
  amount?: string;
  status?: string;
};

function ProfileSidebarSkeleton() {
  return (
    <Card className="shadow-lg border-2 border-primary/10 animate-pulse">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center space-y-2">
          <Skeleton className="h-24 w-24 rounded-full mb-2" />
          <Skeleton className="h-6 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-6 h-10 w-full rounded" />
      </CardContent>
    </Card>
  );
}

function MainContentSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/3 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-primary/5 animate-pulse">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-24 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center gap-4 mb-2">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ErrorFallback() {
  return (
    <div className="text-center text-destructive py-10">
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p>We couldn't load the profile. Please try again later.</p>
    </div>
  );
}

export default async function UserPage({
  params
}: { params: { username: string } }) {
  const { username } = params;

  // Fetch user from the database
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      games: true, // User's games
    },
  });

  if (!user) {
    return (
      <div className="container py-10">
        <div className="text-center text-2xl font-bold">User not found</div>
      </div>
    );
  }

  // Compute stats from available data
  const userStats = {
    totalGames: user.games.length,
    totalPlaytime: 0, // No playtime field in schema
    achievements: 0, // No achievements model
    achievementPoints: 0, // No achievement points in schema
    memberSince: user.createdAt.toLocaleDateString(),
  };

  // Recent games: just use user's games (no playtime/progress fields)
  const recentGames: RecentGame[] = user.games.map((game) => ({
    id: game.id,
    title: game.title,
    image: game.image,
  }));

  // Type the empty arrays for type safety
  const recentAchievements: Achievement[] = [];
  const purchaseHistory: Purchase[] = [];

  return (
    <div className="container py-10 mx-auto fade-in">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <Suspense fallback={<ProfileSidebarSkeleton />}>
          <div className="md:col-span-1">
            <Card className="shadow-lg border-2 border-primary/10">
              <CardHeader className="text-center">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24 border-2 border-primary/30 shadow">
                    <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-bold">{user.username}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">{user.name ?? user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Games</span>
                    <span className="font-medium">{userStats.totalGames}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Playtime</span>
                    <span className="font-medium">{userStats.totalPlaytime} hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Achievements</span>
                    <span className="font-medium">{userStats.achievements}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Achievement Points</span>
                    <span className="font-medium">{userStats.achievementPoints}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Member Since</span>
                    <span className="font-medium">{userStats.memberSince}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Suspense>

        <div className="md:col-span-3 flex flex-col gap-6">
          {/* User Bio (Markdown) - Full width, before tabs */}
          {user.profile && (
            <div className="w-full prose prose-base prose-primary dark:prose-invert bg-background/80 rounded-lg p-6 border border-primary/10 shadow mb-2">
              <ReactMarkdown>{user?.profile}</ReactMarkdown>
            </div>
          )}

          <Suspense fallback={<MainContentSkeleton />}>
            <div className="md:col-span-3">
              <Tabs
                defaultValue="overview"
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="games">Games</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 py-4">
                  <h2 className="text-2xl font-bold">Information</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card className="bg-primary/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg">
                          <Gamepad2 className="mr-2 h-5 w-5" />
                          Game Library
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{userStats.totalGames}</div>
                        <p className="text-sm text-muted-foreground">Games in this collection</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-primary/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg">
                          <Clock className="mr-2 h-5 w-5" />
                          Total Playtime
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{userStats.totalPlaytime}</div>
                        <p className="text-sm text-muted-foreground">Hours played</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-primary/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg">
                          <Trophy className="mr-2 h-5 w-5" />
                          Achievements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{userStats.achievements}</div>
                        <p className="text-sm text-muted-foreground">Unlocked achievements</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recently Played</CardTitle>
                        <CardDescription>Recent gaming activity</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {recentGames.length > 0 ? recentGames.map((game) => (
                            <div key={game.id} className="flex items-center gap-4 group hover:bg-primary/10 rounded transition-all p-2">
                              <div className="relative h-16 w-16 overflow-hidden rounded border bg-muted">
                                <Image
                                  src={game.image || "/file.svg"}
                                  alt={game.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{game.title}</h4>
                              </div>
                            </div>
                          )) : (
                            <div className="text-muted-foreground text-center py-8">No games played yet.</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Achievements</CardTitle>
                        <CardDescription>Latest accomplishments</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {recentAchievements.length > 0 ? recentAchievements.map((achievement) => (
                            <div key={achievement.id} className="flex items-center gap-4">
                              <div className="relative h-12 w-12 overflow-hidden rounded bg-muted">
                                <Image
                                  src={achievement.icon || "/file.svg"}
                                  alt={achievement.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{achievement.title}</h4>
                                  {achievement.rarity && (
                                    <Badge
                                      variant={
                                        achievement.rarity === "Legendary"
                                          ? "destructive"
                                          : achievement.rarity === "Rare"
                                            ? "default"
                                            : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {achievement.rarity}
                                    </Badge>
                                  )}
                                </div>
                                {achievement.game && achievement.date && (
                                  <p className="text-xs text-muted-foreground">
                                    {achievement.game} • {achievement.date}
                                  </p>
                                )}
                              </div>
                              {achievement.points && (
                                <div className="flex items-center font-medium">
                                  +{achievement.points}
                                </div>
                              )}
                            </div>
                          )) : (
                            <div className="text-muted-foreground text-center py-8">No achievements yet.</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Games Tab */}
                <TabsContent value="games" className="py-4">
                  <h2 className="text-2xl font-bold">Games</h2>
                  <p className="text-muted-foreground">
                    Game library and collection
                  </p>
                  {recentGames.length > 0 ? (
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {recentGames.map((game) => (
                        <Card key={game.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                          <div className="relative aspect-video w-full">
                            <Image
                              src={game.image || "/file.svg"}
                              alt={game.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
                            <div className="absolute bottom-3 left-3 right-3">
                              <h3 className="font-semibold text-white drop-shadow-lg">{game.title}</h3>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <div className="flex w-full items-center justify-between">
                              <Button size="sm" asChild>
                                <a href={`/gaming/${game.id}`}>Play</a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 flex h-[200px] flex-col items-center justify-center rounded-lg border bg-card p-8 text-center">
                      <Play className="h-12 w-12 text-muted-foreground" strokeWidth={1} />
                      <h3 className="mt-4 text-lg font-medium">No games yet</h3>
                      <p className="mt-2 text-muted-foreground">
                        No games to display
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Purchases Tab */}
                <TabsContent value="purchases" className="py-4">
                  <h2 className="text-2xl font-bold">Purchase History</h2>
                  <p className="text-muted-foreground">
                    Transaction history and game purchases
                  </p>
                  <Card className="mt-6">
                    <CardContent className="p-0">
                      {purchaseHistory.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Game</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {purchaseHistory.map((purchase) => (
                              <TableRow key={purchase.id}>
                                <TableCell className="font-medium">{purchase.game}</TableCell>
                                <TableCell>{purchase.date}</TableCell>
                                <TableCell>{purchase.amount}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{purchase.status}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-muted-foreground text-center py-8">No purchases yet.</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Add fade-in animation
// In your globals.css or here:
// .fade-in { animation: fadeIn 0.5s ease; }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }