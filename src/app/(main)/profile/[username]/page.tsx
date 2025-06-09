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
import { Trophy, Clock, Gamepad2, User, Play } from "lucide-react";
import prisma from "@/lib/prisma";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

export default async function UserPage({
  params
}: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  // Server action for follow/unfollow
  async function handleFollowAction(formData: FormData) {
    "use server";
    if (!session || !session.user || !session.user.id) return;

    const userId = session.user.id;
    const action = formData.get("action");

    if (typeof action !== "string" || !["follow", "unfollow"].includes(action)) return;

    const targetUser = await prisma.user.findUnique({ where: { username } });
    if (!targetUser) return;

    if (action === "follow") {
      await prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUser.id,
          },
        },
        update: {},
        create: {
          followerId: userId,
          followingId: targetUser.id,
          createdAt: new Date(),
        },
      });
    } else if (action === "unfollow") {
      await prisma.follow.deleteMany({
        where: {
          followerId: userId,
          followingId: targetUser.id,
        },
      });
    }
    revalidatePath(`/profile/${username}`);
    redirect(`/profile/${username}`);
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      games: {
        where: { authorId: undefined }, // This will be replaced below
      },
      followers: {
        include: { follower: true },
      },
      followings: {
        include: { following: true },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Fetch games authored by the user (robust to schema changes)
  const authoredGames = await prisma.game.findMany({
    where: { authorId: user.id, status: "PUBLISHED" },
    orderBy: { createdAt: 'desc' },
  });

  const userStats = {
    totalGames: authoredGames.length,
    totalPlaytime: 0,
    achievements: 0,
    achievementPoints: 0,
    memberSince: user.createdAt.toLocaleDateString(),
  };

  // Prepare followers and followings as user arrays, excluding self
  const allFollowers = user.followers
    .map(f => f.follower)
    .filter(u => u.id !== user.id);
  const allFollowings = user.followings
    .map(f => f.following)
    .filter(u => u.id !== user.id);

  const isOwnProfile = session?.user?.id === user.id;
  const isFollowing = Boolean(
    session?.user &&
    user.followers.some(
      f => f.followerId === session.user.id && f.followingId === user.id
    )
  );

  const recentAchievements: Achievement[] = [];
  const purchaseHistory: Purchase[] = [];

  return (
    <div className="container py-10 mx-auto px-2 fade-in">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <Suspense fallback={<ProfileSidebarSkeleton />}>
          <div className="md:col-span-1">
            <Card className="shadow-lg border-2 border-primary/10">
              <CardHeader className="text-center">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24 border-2 border-primary/30 shadow">
                    <AvatarImage src={user.image ?? undefined} alt={user.name || "User"} />
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
                    <span className="text-sm text-muted-foreground">Followers</span>
                    <span className="font-medium">{allFollowers.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Following</span>
                    <span className="font-medium">{allFollowings.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Games Authored</span>
                    <span className="font-medium">{userStats.totalGames}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Member Since</span>
                    <span className="font-medium">{userStats.memberSince}</span>
                  </div>
                </div>
                {/* Profile action button */}
                {session && (
                  <form action={handleFollowAction}>
                    <Button
                      variant="outline"
                      className="mt-6 w-full"
                      type="submit"
                      name="action"
                      disabled={isOwnProfile}
                      value={isFollowing ? "unfollow" : "follow"}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
            {/* Follower/Following List */}
            <div className="mt-6">
              {/* Followers */}
              <div className="mb-2 font-semibold text-sm text-muted-foreground">Followers</div>
              {allFollowers.length > 0 ? (
                <ul className="space-y-2">
                  {allFollowers.slice(0, 10).map(f => (
                    <li key={f.id} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={f.image ?? undefined} alt={f.username} />
                        <AvatarFallback>{f.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                      </Avatar>
                      <a href={`/profile/${f.username}`} className="hover:underline text-sm">{f.username}</a>
                    </li>
                  ))}
                  {allFollowers.length > 10 && (
                    <li className="text-xs text-muted-foreground">and {allFollowers.length - 10} more...</li>
                  )}
                </ul>
              ) : (
                <div className="text-xs text-muted-foreground">No followers yet.</div>
              )}
              {/* Following */}
              <div className="mt-4 mb-2 font-semibold text-sm text-muted-foreground">Following</div>
              {allFollowings.length > 0 ? (
                <ul className="space-y-2">
                  {allFollowings.slice(0, 10).map(f => (
                    <li key={f.id} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={f.image ?? undefined} alt={f.username} />
                        <AvatarFallback>{f.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                      </Avatar>
                      <a href={`/profile/${f.username}`} className="hover:underline text-sm">{f.username}</a>
                    </li>
                  ))}
                  {allFollowings.length > 10 && (
                    <li className="text-xs text-muted-foreground">and {allFollowings.length - 10} more...</li>
                  )}
                </ul>
              ) : (
                <div className="text-xs text-muted-foreground">Not following anyone yet.</div>
              )}
            </div>
          </div>
        </Suspense>

        <div className="md:col-span-3 flex flex-col gap-6">
          {/* User Bio (Markdown) - Full width, before tabs */}
          <div className="w-full prose prose-base prose-primary dark:prose-invert bg-background/80 rounded-lg p-6 border border-dashed border-primary/10 shadow mb-2">
            {user.profile ? (
              <ReactMarkdown>{user.profile}</ReactMarkdown>
            ) : (
              <span className="text-muted-foreground italic">This user has not added a profile bio yet.</span>
            )}
          </div>

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
                          Authored Games
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{userStats.totalGames}</div>
                        <p className="text-sm text-muted-foreground">Games authored by this user</p>
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
                          {authoredGames.length > 0 ? authoredGames.map((game) => (
                            <div key={game.id} className="flex items-center gap-4 group hover:bg-primary/10 rounded transition-all p-2">
                              <div className="relative h-16 w-16 overflow-hidden rounded border bg-muted">
                                <Image
                                  src={game.image || "https://placehold.co/600x400"}
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
                  <h2 className="text-2xl font-bold">Authored Games</h2>
                  <p className="text-muted-foreground">
                    Games created and published by this user
                  </p>
                  {authoredGames.length > 0 ? (
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {authoredGames.map((game) => (
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
                                <a href={`/game/${game.slug}`}>Play</a>
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
      </div >
    </div >
  );
}

// Add dynamic metadata export for Next.js App Router
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  // Optionally fetch user data for richer metadata
  const { username } = await params;
  return {
    title: `${username} | Profile | AsobiHub`,
    description: `View the gaming profile, followers, and achievements of ${username} on AsobiHub.`,
    openGraph: {
      title: `${username} | Profile | AsobiHub`,
      description: `View the gaming profile, followers, and achievements of ${username} on AsobiHub.`,
      url: `https://asobihub.com/profile/${username}`,
      type: 'profile',
      siteName: 'AsobiHub',
      images: [
        {
          url: '/file.svg', // fallback or use user image if available
          width: 600,
          height: 400,
          alt: `${username}'s profile image`,
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary',
      title: `${username} | Profile | AsobiHub`,
      description: `View the gaming profile, followers, and achievements of ${username} on AsobiHub.`,
      site: '@asobihub',
      creator: '@asobihub',
      images: ['/file.svg'],
    },
    alternates: {
      canonical: `/profile/${username}`,
    },
  };
}