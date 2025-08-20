# Chill

This is a Next.js app with an admin uploader that sends images to ImgChest and lists posts from an npoint.io bin.

## Getting Started

1) Copy environment template and fill values
- Duplicate `.env.example` as `.env.local` and set all required variables (see below).

2) Install and run
- npm install
- npm run dev

Open http://localhost:3000.

## Environment variables
Paste these in `.env.local` (see `.env.example` for comments):

- Client (public)
  - NEXT_PUBLIC_FIREBASE_API_KEY
  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  - NEXT_PUBLIC_FIREBASE_APP_ID
  - NEXT_PUBLIC_ADMIN_EMAIL (Google account allowed into /admin)

- Server
  - NEXT_PUBLIC_IMG_CHEST_TOKEN (used by API routes when calling ImgChest)
  - NEXT_PUBLIC_NPOINT_ID (npoint.io bin that stores ImgChest post IDs)
  - FIREBASE_PROJECT_ID
  - FIREBASE_CLIENT_EMAIL
  - FIREBASE_PRIVATE_KEY (keep \n escapes)

Notes
- Do not commit `.env.local`.
- The token is read only on server routes; avoid using it in client code.

## Features
- /admin: Google sign-in (Firebase) gated by NEXT_PUBLIC_ADMIN_EMAIL, upload multiple images to ImgChest, optional title and description.
- /api/admin/upload: verifies Firebase ID token server-side, uploads to ImgChest, optionally updates first image description, appends post ID to npoint bin.
- /api/posts: reads post IDs from npoint bin, fetches each ImgChest post, returns title, first image, description, and created date formatted via `formatDateToMonthYear`.

## Security
- Keep Firebase Admin private key safe. If pasting, preserve literal \n newlines.
- Never expose sensitive tokens in client code.

## Scripts
- dev: next dev --turbopack
- build: next build
- start: next start

## Deployment
- Provide the same env vars in your hosting platform.
- Ensure body size limits are sufficient for uploads (serverActions bodySizeLimit is set to 20mb in next.config.ts).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
