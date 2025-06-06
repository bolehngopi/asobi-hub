"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import { GameCard } from "@/components/game-card";

interface Game {
  id: number;
  name: string;
  price: number;
  rating: number;
  // ...other fields
}

interface FetchResponse {
  games: Game[];
  categories: string[];
}

// Fetch games and categories from backend
async function fetchGames(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, val]) => {
      if (val !== undefined && val !== "") acc[key] = String(val);
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const res = await fetch(`/api/marketplace?${query}`);
  if (!res.ok) throw new Error("Failed to fetch games");
  return (await res.json()) as FetchResponse;
}

export default function MarketplacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // --- Constants ---
  const SLIDER_MIN = 0;
  const SLIDER_MAX = 2_000_000;
  const SLIDER_STEP = 10_000;

  // --- Initial values from URL ---
  const initialSearch = searchParams.get("search") ?? "";
  const initialCategory = searchParams.get("category") ?? "All Categories";
  const initialSort = searchParams.get("sort") ?? "newest";
  const priceMinParam = parseInt(searchParams.get("priceMin") ?? "");
  const priceMaxParam = parseInt(searchParams.get("priceMax") ?? "");
  const hasValidPriceRange = !isNaN(priceMinParam) && !isNaN(priceMaxParam);

  // --- Local state ---
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(
    hasValidPriceRange
      ? [priceMinParam, priceMaxParam]
      : [SLIDER_MIN, SLIDER_MAX]
  );
  const [localSearch, setLocalSearch] = useState(initialSearch);
  const [localCategory, setLocalCategory] = useState(initialCategory);
  const [localSort, setLocalSort] = useState(initialSort);
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<string[]>(["All Categories"]);
  const [loading, setLoading] = useState(true);

  // --- Sync URL params to local state (for browser nav/manual URL edits) ---
  useEffect(() => {
    const newSearch = searchParams.get("search") ?? "";
    const newCategory = searchParams.get("category") ?? "All Categories";
    const newSort = searchParams.get("sort") ?? "newest";
    const minP = parseInt(searchParams.get("priceMin") ?? "");
    const maxP = parseInt(searchParams.get("priceMax") ?? "");
    const validRange = !isNaN(minP) && !isNaN(maxP);

    if (newSearch !== localSearch) setLocalSearch(newSearch);
    if (newCategory !== localCategory) setLocalCategory(newCategory);
    if (newSort !== localSort) setLocalSort(newSort);
    if (validRange && (minP !== localPriceRange[0] || maxP !== localPriceRange[1])) {
      setLocalPriceRange([minP, maxP]);
    } else if (!validRange && (localPriceRange[0] !== SLIDER_MIN || localPriceRange[1] !== SLIDER_MAX)) {
      setLocalPriceRange([SLIDER_MIN, SLIDER_MAX]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // --- Debounced: sync local filter state to URL ---
  const debouncedUpdateURL = useDebouncedCallback(
    (filters: {
      search?: string;
      category?: string;
      sort?: string;
      priceMin?: number;
      priceMax?: number;
    }) => {
      const newParams = new URLSearchParams(searchParams.toString());
      // search
      if (filters.search !== undefined) {
        filters.search === "" ? newParams.delete("search") : newParams.set("search", filters.search);
      }
      // category
      if (filters.category !== undefined) {
        ["", "All Categories"].includes(filters.category)
          ? newParams.delete("category")
          : newParams.set("category", filters.category);
      }
      // sort
      if (filters.sort !== undefined) {
        ["", "newest"].includes(filters.sort)
          ? newParams.delete("sort")
          : newParams.set("sort", filters.sort);
      }
      // priceMin / priceMax
      if (filters.priceMin !== undefined) newParams.set("priceMin", String(filters.priceMin));
      if (filters.priceMax !== undefined) newParams.set("priceMax", String(filters.priceMax));
      router.replace(`${pathname}?${newParams.toString()}`);
    },
    500
  );

  useEffect(() => {
    debouncedUpdateURL({
      search: localSearch,
      category: localCategory,
      sort: localSort,
      priceMin: localPriceRange[0],
      priceMax: localPriceRange[1],
    });
  }, [localSearch, localCategory, localSort, localPriceRange[0], localPriceRange[1], debouncedUpdateURL]);

  // --- Fetch data when URL params change ---
  useEffect(() => {
    const searchQS = searchParams.get("search") ?? "";
    const catQS = searchParams.get("category") ?? "All Categories";
    const sortQS = searchParams.get("sort") ?? "newest";
    const minQ = parseInt(searchParams.get("priceMin") ?? "");
    const maxQ = parseInt(searchParams.get("priceMax") ?? "");
    const validRangeQ = !isNaN(minQ) && !isNaN(maxQ);
    const prange: [number, number] = validRangeQ ? [minQ, maxQ] : [SLIDER_MIN, SLIDER_MAX];

    setLoading(true);
    fetchGames({
      search: searchQS,
      category: catQS,
      sort: sortQS,
      priceMin: prange[0],
      priceMax: prange[1],
    })
      .then((data) => {
        setGames(data.games);
        setCategories(Array.from(new Set(["All Categories", ...data.categories])));
      })
      .catch((err) => console.error("fetchGames error:", err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  // --- Reset filters ---
  const handleResetFilters = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  // --- Render ---
  return (
    <div className="container py-10 mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Game Marketplace</h1>
          <p className="text-muted-foreground">Discover and purchase games from our extensive collection</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar: Filters */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h2 className="font-semibold">Filters</h2>
            <Separator className="my-4" />
            <div className="space-y-4">
              {/* Category Dropdown */}
              <div>
                <label className="text-sm font-medium">Categories</label>
                <Select value={localCategory} onValueChange={setLocalCategory}>
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
              {/* Price Range Slider */}
              <div>
                <label className="text-sm font-medium">Price Range (IDR)</label>
                <div className="mt-2 px-2">
                  <Slider
                    min={SLIDER_MIN}
                    max={SLIDER_MAX}
                    step={SLIDER_STEP}
                    value={localPriceRange}
                    onValueChange={(newRange) => setLocalPriceRange(newRange as [number, number])}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span>Rp {localPriceRange[0].toLocaleString("id-ID")}</span>
                  <span>Rp {localPriceRange[1].toLocaleString("id-ID")}</span>
                </div>
              </div>
              {/* Reset Button */}
              <Button variant="outline" className="w-full" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
        {/* Main: Search, Sort, Game List */}
        <div className="lg:col-span-3">
          {/* Search & Sort */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                className="pl-8"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Sort by:</span>
              <Select value={localSort} onValueChange={setLocalSort}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Game List */}
          {loading ? (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border bg-card p-8 text-center">
              <span>Loading...</span>
            </div>
          ) : games.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <GameCard key={game.id} {...game} />
              ))}
            </div>
          ) : (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border bg-card p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground" strokeWidth={1} />
              <h3 className="mt-4 text-lg font-medium">No games found</h3>
              <p className="mt-2 text-muted-foreground">Try adjusting your search or filters to find what you’re looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

