"use client";

import { useState, Suspense, memo } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { AuthNavClient } from "./auth-nav-client";
import { Button } from "../ui/button";
import Logo from "@/components/logo";

export function NavbarLinks({ genres }: { genres: { name: string; description: string | null; slug: string }[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex flex-1 items-center justify-end md:justify-between">
          {/* Desktop Navigation */}
          <NavigationMenu aria-label="Global" className="hidden md:block">
            <NavigationMenuList className="flex items-center gap-6 text-sm">
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                  href="/marketplace"
                >
                  Browse
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75">
                  Genre
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {genres.map((category) => (
                      <ListItem
                        key={category.name}
                        title={category.name}
                        href={`/marketplace/genre/${category.slug}`}
                      >
                        {category.description ?? ""}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            <nav className="sm:flex sm:gap-4">
              <Suspense fallback={<Skeleton className="h-12 w-12 rounded-full" />}>
                <AuthNavClient />
              </Suspense>
            </nav>
          </div>
          {/* Hamburger Button */}
          <Button
            variant={"ghost"}
            className="md:hidden p-2 text-gray-500 hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            type="button"
          >
            <span className="sr-only">Toggle menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-inherit border-b px-4 pb-4">
          <nav className="flex flex-col gap-2 mt-2">
            <Link href="/marketplace" className="py-2 text-gray-700 dark:text-white font-medium hover:underline">Browse</Link>
            <details>
              <summary className="py-2 text-gray-700 dark:text-white font-medium cursor-pointer">Genre</summary>
              <ul className="pl-4 flex flex-col gap-1">
                {genres.map((category) => (
                  <li key={category.name}>
                    <Link href={`/marketplace/genre/${category.slug}`} className="block py-1 text-sm text-gray-600 dark:text-gray-300 hover:underline">
                      <div>{category.name}</div>
                      <div className="text-xs text-muted-foreground">{category.description ?? ''}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
            <div className="pt-2 border-t mt-2">
              <Suspense fallback={<Skeleton className="h-12 w-12 rounded-full" />}>
                <AuthNavClient />
              </Suspense>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

const ListItem = memo(function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">{children}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});