## Intern Quote Generator

By: Chan EkMongkol

### Brief Description

A minimal Next.js app to discover random quotes and save favorites with Clerk authentication, Drizzle ORM, and a PostgreSQL database. Built with Next.js 15, Tailwind CSS 4, Drizzle ORM, and Clerk.

### Tech Stack

- Next.js
- Tailwind CSS 4, next-themes, shadcn-style UI components
- Drizzle ORM with PostgreSQL (`postgres` driver)
- Clerk for auth and middleware
- Biome for lint/format

### Setup Instructions

1. Prerequisites

- Node.js 18+ and a PostgreSQL instance
- Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://USER:PASS@HOST:PORT/DB_NAME"

# Clerk (Dashboard → API Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

2. Install dependencies

```bash
# with npm
npm install

# or with pnpm
pnpm install
```

3. Database migrations

```bash
# Apply migrations (uses drizzle.config.ts and ./drizzle folder)
npx drizzle-kit migrate
```

4. Seed sample quotes (optional)

```bash
# Runs TypeScript directly without adding new deps
npx tsx scripts/seed.ts
```

5. Run the app

```bash
# dev
npm run dev

# build and start
npm run build
npm start
```

6. Dev utilities (optional)

```bash
# lint
npm run lint

# format
npm run format
```

### Architecture

- Frontend (UI)

  - `src/app/page.tsx` is a Server Component that fetches auth state and favorites.
  - It renders a Client Component (`quote-page.tsx`) that handles interactions (fetch new quote, toggle favorite), theme switching, and Clerk UI (`UserButton`, `SignInButton`).

- Backend (Server Actions)

  - `src/app/actions/actions.ts` exposes server actions:
    - `getRandomQuote()` selects one quote at random and checks favorite state.
    - `getUserFavorites()` returns the user’s favorite quotes.
    - `toggleFavorite(quoteId)` inserts or deletes a favorite for the authenticated user.
    - `syncUser()` upserts the Clerk user into the `users` table.
  - These are invoked directly from client components via React Server Actions.

- Database

  - Drizzle ORM with PostgreSQL (`src/db/schema.ts`, `src/db/index.ts`).
  - Tables: `users`, `quotes`, `favorites`.
  - Migrations live in `./drizzle` and are applied via `drizzle-kit migrate`.
  - Optional seeding via `scripts/seed.ts`.

- Authentication
  - Clerk middleware (`src/middleware.ts`) protects routes and provides server-side `auth()`/`currentUser()`.
  - Public pages still render; signed-in users can save favorites.

### Notes

- Ensure `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY` are set before running migrations or server actions.
- UI theming uses `next-themes` via `src/components/theme-provider.tsx` and a `ModeToggle` button.
