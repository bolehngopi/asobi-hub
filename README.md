
# Asobi Hub

A game store website inspired by itc.io. Built it for my assingment. Hope you like it

## Features

- Light/dark mode toggle
- Admin dashboard
- Playing game in browser
- Authentications

## Demo

https://asobi-hub.vercel.app

## Tech Stack

- Fullstack Framework: [Next.js](https://www.nextjs.org)
- Authentication: [Better Auth](https://www.better-auth.com/)
- Database: Postgres
- Databse ORM: [Prisma](https://www.prisma.io/)
- Payment Gateway: [Xendit](https://www.xendit.co)
- Component Library: [shadcn](https://ui.shadcn.com/)

## Deployment

Before deployment, you need:

1. Xendit Account and Business
2. Database
3. Github App or Github Oauth App

After that you need to setup the [environment variable](#environment-variables) and build the project or deploy it using Vercel.

>this project is built using pnpm, so you need to install pnpm first

```bash
  pnpm install
  pnpm build
```

## Environment Variables

To run this project, you will need to add the following environment variable [example](https://github.com/bolehngopi/asobi-hub/blob/master/.env.example) to your .env file

`DATABASE_URL` Url of the database

`BETTER_AUTH_SECRET`  Random value of anything

`BETTER_AUTH_URL`  Base URL of your app

`GITHUB_CLIENT_ID`  Client id of github app

`GITHUB_CLIENT_SECRET`  Client secret of github app

`XENDIT_API_KEY`  Xendit secret key

`XENDIT_WEBHOOK_SECRET`  Xendit webhook verification token

## Authors

- [@bolehngopi](https://github.com/bolehngopi)

## Feedback

If you have any feedback, please consider making an issue
