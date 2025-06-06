"use client";

import { authClient } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useMemo } from "react";
import { ChevronDown } from "lucide-react";

export function AuthNavClient() {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();

  const loginUrl = useMemo(
    () => `/login?callbackUrl=${encodeURIComponent(pathname)}`,
    [pathname]
  );
  const registerUrl = "/register";
  const profileUrl = `/profile/${session?.user.username}`;

  if (!session) {
    return (
      <>
        <Button asChild aria-label="Login">
          <Link href={loginUrl}>Login</Link>
        </Button>
        <Button variant="outline" asChild aria-label="Register">
          <Link href={registerUrl}>Register</Link>
        </Button>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="cursor-pointer size-10">
        <AvatarImage src={session.user.image ?? undefined} />
        <AvatarFallback>{session.user.username}</AvatarFallback>
      </Avatar>
      <Link
        href={profileUrl}
        className="hidden md:inline-flex text-sm font-medium text-gray-800 dark:text-white hover:underline"
      >
        <span>{session.user.username ?? session.user.name}</span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ChevronDown className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-300" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Explore</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={'/dashboard'}>My Library</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Create</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={'/dashboard'}>Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={'/game/new'}>Upload new game</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={profileUrl}>Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={'/user/settings'}>Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <button
              type="button"
              onClick={() => authClient.signOut()}
              aria-label="Logout"
            >
              Logout
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

  );
}
