"use client";

import { useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search, Star } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data - in a real app, this would come from an API
const mockGames = [
  {
    id: "1",
    title: "Cyber Adventure 2077",
    description: "An open-world RPG set in a dystopian future",
    price: 59.99,
    discountPrice: 39.99,
    rating: 4.5,
    coverImage:
      "https://images.pexels.com/photos/7915264/pexels-photo-7915264.jpeg?auto=compress&cs=tinysrgb&w=600",
    categories: ["RPG", "Action", "Open World"],
    releaseDate: "2023-11-15",
  },
  {
    id: "2",
    title: "Fantasy Quest IV",
    description: "Embark on an epic journey through magical realms",
    price: 49.99,
    discountPrice: null,
    rating: 4.8,
    coverImage:
      "https://images.pexels.com/photos/7915255/pexels-photo-7915255.jpeg?auto=compress&cs=tinysrgb&w=600",
    categories: ["RPG", "Fantasy", "Adventure"],
    releaseDate: "2023-09-22",
  },
  {
    id: "3",
    title: "Space Explorer: Odyssey",
    description: "Explore the vastness of space in this sci-fi adventure",
    price: 39.99,
    discountPrice: 29.99,
    rating: 4.2,
    coverImage:
      "https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?auto=compress&cs=tinysrgb&w=600",
    categories: ["Adventure", "Sci-Fi", "Exploration"],
    releaseDate: "2024-01-10",
  },
  {
    id: "4",
    title: "Racing Evolution 2025",
    description: "Experience the thrill of high-speed racing",
    price: 54.99,
    discountPrice: null,
    rating: 4.6,
    coverImage:
      "https://images.pexels.com/photos/163696/playstation-controller-sony-controller-joystick-163696.jpeg?auto=compress&cs=tinysrgb&w=600",
    categories: ["Racing", "Sports", "Simulation"],
    releaseDate: "2023-12-05",
  },
  {
    id: "5",
    title: "Medieval Conquest",
    description: "Build your empire and conquer new territories",
    price: 44.99,
    discountPrice: 34.99,
    rating: 4.3,
    coverImage:
      "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=600",
    categories: ["Strategy", "Historical", "Multiplayer"],
    releaseDate: "2023-08-18",
  },
  {
    id: "6",
    title: "Zombie Outbreak",
    description: "Survive the apocalypse in this horror action game",
    price: 29.99,
    discountPrice: null,
    rating: 4.1,
    coverImage:
      "https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg?auto=compress&cs=tinysrgb&w=600",
    categories: ["Horror", "Survival", "Action"],
    releaseDate: "2023-10-31",
  },
];

const categories = [
  "All Categories",
  "Action",
  "Adventure",
  "RPG",
  "Strategy",
  "Simulation",
  "Sports",
  "Racing",
  "Puzzle",
  "Horror",
];

export default function MarketplacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 1) Read each filter from the URL (if it exists). Otherwise, fall back to default.
  const searchQueryParam = searchParams.get("search") ?? "";
  const selectedCategoryParam = searchParams.get("category") ?? "All Categories";
  const sortByParam = searchParams.get("sort") ?? "newest";

  // Price range: we expect two separate params: priceMin and priceMax. Fallback to [0, 60].
  const priceMinParam = parseFloat(searchParams.get("priceMin") ?? "");
  const priceMaxParam = parseFloat(searchParams.get("priceMax") ?? "");

  // Make sure priceRange is always an array of two valid numbers.
  // If either parse fails (NaN), fall back to [0, 60].
  const priceRange: [number, number] =
    !isNaN(priceMinParam) && !isNaN(priceMaxParam)
      ? [priceMinParam, priceMaxParam]
      : [0, 60];

  // 2) Whenever a filter changes, we update the query string.
  //    Helper to push new search params without losing other filters:
  const updateQueryParam = useCallback((key: string, value: string) => {
    // Clone existing params:
    const newParams = new URLSearchParams(searchParams.toString());

    if (value === "" || value == null) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }

    // Always push to the same pathname
    router.push(`${pathname}?${newParams.toString()}`);
  }, [searchParams, router, pathname]);

  const updatePriceRange = useCallback((newRange: [number, number]) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("priceMin", newRange[0].toString());
    newParams.set("priceMax", newRange[1].toString());
    router.push(`${pathname}?${newParams.toString()}`);
  }, [searchParams, router, pathname]);

  // 3) Filter the mockGames array based on these URL‐driven values:
  const filteredGames = useMemo(() => {
    return mockGames.filter((game) => {
      const matchesSearch = game.title
        .toLowerCase()
        .includes(searchQueryParam.toLowerCase());

      const matchesCategory =
        selectedCategoryParam === "All Categories" ||
        game.categories.includes(selectedCategoryParam);

      const price = game.discountPrice ?? game.price;
      const matchesPrice =
        price >= priceRange[0] && price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchQueryParam, selectedCategoryParam, priceRange]);

  // 4) Sort after filtering:
  const sortedGames = useMemo(() => {
    return [...filteredGames].sort((a, b) => {
      if (sortByParam === "newest") {
        return (
          new Date(b.releaseDate).getTime() -
          new Date(a.releaseDate).getTime()
        );
      } else if (sortByParam === "price-low") {
        return (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price);
      } else if (sortByParam === "price-high") {
        return (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price);
      } else if (sortByParam === "rating") {
        return b.rating - a.rating;
      }
      return 0;
    });
  }, [filteredGames, sortByParam]);

  // Memoize handlers
  const handleResetFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  // 6) If the URL changes (e.g. user manually edits it), the component will re-render
  //    with updated `searchParams`—so no extra useEffect is needed to sync state.

  return (
    <div className="container py-10 mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Game Marketplace
          </h1>
          <p className="text-muted-foreground">
            Discover and purchase games from our extensive collection
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h2 className="font-semibold">Filters</h2>
            <Separator className="my-4" />

            <div className="space-y-4">
              {/* -- Category Dropdown -- */}
              <div>
                <label className="text-sm font-medium">Categories</label>
                <Select
                  value={selectedCategoryParam}
                  onValueChange={(val) => updateQueryParam("category", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* -- Price Range Slider -- */}
              <div>
                <label className="text-sm font-medium">
                  Price Range
                </label>
                <div className="mt-2 px-2">
                  <Slider
                    defaultValue={[0, 60]}
                    max={100}
                    step={5}
                    value={priceRange}
                    onValueChange={(newRange) =>
                      updatePriceRange(newRange as [number, number])
                    }
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span>{priceRange[0]}</span>
                  <span>{priceRange[1]}</span>
                </div>
              </div>

              {/* -- Reset Filters Button -- */}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Game grid + search + sort */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* -- Search Input -- */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                className="pl-8"
                value={searchQueryParam}
                onChange={(e) =>
                  updateQueryParam("search", e.target.value)
                }
              />
            </div>

            {/* -- Sort Dropdown -- */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Sort by:</span>
              <Select
                value={sortByParam}
                onValueChange={(val) => updateQueryParam("sort", val)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">
                    Price: Low to High
                  </SelectItem>
                  <SelectItem value="price-high">
                    Price: High to Low
                  </SelectItem>
                  <SelectItem value="rating">
                    Highest Rated
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* {sortedGames.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedGames.map((game) => (
                <GameCard
                  key={game.id}
                  title={game.title}
                  description={game.description}
                  imageUrl={game.coverImage}
                  href={`/marketplace/games/${game.id}`}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border bg-card p-8 text-center">
              <Search
                className="h-12 w-12 text-muted-foreground"
                strokeWidth={1}
              />
              <h3 className="mt-4 text-lg font-medium">No games found</h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your search or filters to find what
                you’re looking for.
              </p>
            </div>
          )} */}

          {sortedGames.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedGames.map((game) => (
                <Card
                  key={game.id}
                  className="overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="aspect-[16/9] w-full relative">
                    <Image
                      src={game.coverImage}
                      alt={game.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <CardHeader className="p-4 pb-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/marketplace/games/${game.id}`}
                          className="hover:underline"
                        >
                          <h3 className="font-semibold">
                            {game.title}
                          </h3>
                        </Link>
                        <div className="mt-1 flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm font-medium">
                            {game.rating}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {game.discountPrice ? (
                          <>
                            <span className="font-medium">
                              {game.discountPrice}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {game.price}
                            </span>
                          </>
                        ) : (
                          <span className="font-medium">
                            {game.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-2">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {game.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {game.categories.map((category) => (
                        <Badge
                          key={category}
                          variant="secondary"
                          className="text-xs"
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>

                  {/* author */}
                  <CardFooter className="p-4 pt-0">
                    <div className="text-xs text-muted-foreground">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button variant="link">@nextjs</Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="flex justify-between gap-4">
                            <Avatar>
                              <AvatarImage src="https://github.com/vercel.png" />
                              <AvatarFallback>VC</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">@nextjs</h4>
                              <p className="text-sm">
                                The React Framework – created and maintained by @vercel.
                              </p>
                              <div className="text-muted-foreground text-xs">
                                Joined December 2021
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border bg-card p-8 text-center">
              <Search
                className="h-12 w-12 text-muted-foreground"
                strokeWidth={1}
              />
              <h3 className="mt-4 text-lg font-medium">No games found</h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your search or filters to find what
                you’re looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
