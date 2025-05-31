import prisma from "@/lib/prisma";
import { NavbarLinks } from "./nav-links";

export default async function Navbar() {
  const genres = await prisma.genre.findMany({
    select: { name: true, description: true, slug: true },
    orderBy: { name: "asc" },
  });
  
  return <NavbarLinks genres={genres} />;
}