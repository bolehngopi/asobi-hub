import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "./prisma";
import { createAuthMiddleware, username } from "better-auth/plugins";

function makeUsernameBase(email: string) {
  const localPart = email.split("@")[0];
  // remove non‐alphanumeric characters, lowercase, etc.
  return localPart.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

async function findUniqueUsername(base: string): Promise<string> {
  let attempt = 0;
  let candidate = "";
  while (true) {
    // Append a random 4‐digit number on attempts > 0
    candidate = attempt === 0
      ? base
      : `${base}${Math.floor(Math.random() * 9000 + 1000)}`; // 1000–9999

    // Check the DB to see if anyone already has this username
    const existing = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true }, // we only need to know if it exists
    });

    if (!existing) {
      // Found a free one!
      return candidate;
    }

    attempt += 1;
    // (In theory, after many attempts you might bail or switch strategy,
    // but usually a few loops is plenty.)
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      
    }),
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
    username()
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // Cache duration in seconds
    }
  }
})