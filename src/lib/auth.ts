import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "./prisma";
import { admin as adminPlugin, username } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => {
        console.log({ profile });
        // Exclude 'id' from the returned profile
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = profile;
        return {
          ...rest,
          name: profile.name || `${profile.login}`,
          username: profile.login,
        };
      },
    }
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
    username(),
    adminPlugin(),
    // openAPI()
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
    }
  },
  user: {
    additionalFields: {
      website: {
        type: "string",
        required: false,
      },
      twitter: {
        type: "string",
        required: false,
      },
      profile: {
        type: "string",
        required: false,
      },
      username: {
        type: "string",
        required: false,
      }
    },
  },
})