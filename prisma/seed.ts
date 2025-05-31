import { Prisma, PrismaClient } from "@/generated/prisma";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const genreData: Prisma.GenreCreateInput[] = [
  {
    id: faker.string.uuid(),
    name: "Action",
    slug: "action",
    description: faker.lorem.sentence(),
  },
  {
    id: faker.string.uuid(),
    name: "Adventure",
    slug: "adventure",
    description: faker.lorem.sentence(),
  },
  {
    id: faker.string.uuid(),
    name: "Role-Playing",
    slug: "role-playing",
    description: faker.lorem.sentence(),
  },
  {
    id: faker.string.uuid(),
    name: "Simulation",
    slug: "simulation",
    description: faker.lorem.sentence(),
  },
  {
    id: faker.string.uuid(),
    name: "Strategy",
    slug: "strategy",
    description: faker.lorem.sentence(),
  },
  {
    id: faker.string.uuid(),
    name: "Sports",
    slug: "sports",
    description: faker.lorem.sentence(),
  },
  {
    id: faker.string.uuid(),
    name: "Puzzle",
    slug: "puzzle",
    description: faker.lorem.sentence(),
  },
]

const tagData: Prisma.TagCreateInput[] = [
  {
    id: faker.string.uuid(),
    name: "Multiplayer",
    slug: "multiplayer",
  },
  {
    id: faker.string.uuid(),
    name: "Singleplayer",
    slug: "singleplayer",
  },
  {
    id: faker.string.uuid(),
    name: "Open World",
    slug: "open-world",
  },
  {
    id: faker.string.uuid(),
    name: "Indie",
    slug: "indie",
  },
];

export async function main() {
  console.log("Seeding genres...");
  for (const genre of genreData) {
    await prisma.genre.create({ data: genre });
  }

  console.log("Seeding tags...");
  for (const tag of tagData) {
    await prisma.tag.create({ data: tag });
  }

  console.log("Seeding completed.");
}

main();