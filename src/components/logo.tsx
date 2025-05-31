import { Gamepad } from "lucide-react";
import Link from "next/link";

export default function Logo({
  className,
  ...props
}: React.HTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link href="/" className={`flex items-center text-gray-800 dark:text-white ${className}`} {...props}>
      <span className="sr-only">Home</span>
      <Gamepad className="size-6" />
      <span className="ml-2 text-lg font-semibold">AsobiHub</span>
    </Link>
  );
}