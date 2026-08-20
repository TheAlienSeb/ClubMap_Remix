# ClubMap

A map-centered campus events platform built with Next.js, Mapbox, NextAuth,
PostgreSQL/Drizzle, and Supabase Storage.

## Getting Started

Copy `.env.example` to `.env.local`, provide valid credentials, and create a
public Supabase Storage bucket named `event-media`. The email configured as
`CLUBMAP_BOOTSTRAP_ADMIN_EMAIL` becomes the first administrator when registered.

Development uses the file-backed local store automatically, with no migration
required. Run `npm run dev` and use the test accounts below; local events,
RSVPs, chats, and messages persist in `.clubmap/local-data.json`. Set
`CLUBMAP_LOCAL_MODE=false` to test against PostgreSQL instead.

Apply the database schema and start the development server:

```bash
npm run migrate
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Student login is at `/login`; organizer and administrator login is at
`/admin/login`.

## Development test accounts

After applying migrations, seed the development-only accounts with:

```bash
npm run seed:test-users
```

- Admin: `admin@clubmap.test` / `Admin123!`
- Student: `student@clubmap.test` / `Student123!`

The seed command refuses to run when `NODE_ENV=production`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
