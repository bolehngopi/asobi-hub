import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Gamepad } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className, "border-t bg-background")}>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 mx-auto">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Gamepad className="h-6 w-6" />
          <p className="text-center text-sm leading-loose md:text-left">
            &copy; {new Date().getFullYear()} AsobiHub. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <Link
            href="/terms"
            className="text-sm underline underline-offset-4"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="text-sm underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          <Link
            href="/about"
            className="text-sm underline underline-offset-4"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="text-sm underline underline-offset-4"
          >
            Contact
          </Link>
        </div>

        {/* Theme toggle */}
        <ModeToggle />
      </div>
    </footer>
  );
}