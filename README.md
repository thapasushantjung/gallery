This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Admin Uploader

This Next.js app includes a simple admin panel at `/admin` to upload images to ImgChest via a secure server route.

### Setup

1. Copy `.env.example` to `.env.local` and fill values.
2. Ensure `NEXT_PUBLIC_IMG_CHEST_TOKEN` is set (server-only).
3. Provide Firebase Web SDK config (NEXT_PUBLIC_ vars) and Admin SDK service account envs.
4. Set `NEXT_PUBLIC_ADMIN_EMAIL` to your email used for Google sign-in.

### Run

- npm run dev

### How it works

- Client (`/admin`) authenticates with Firebase Google auth.
- The server API (`/api/admin/upload`) verifies the Firebase ID token and checks email matches `NEXT_PUBLIC_ADMIN_EMAIL`.
- The server forwards files to ImgChest using `NEXT_PUBLIC_IMG_CHEST_TOKEN` from server env.

### Security

- Never expose `NEXT_PUBLIC_IMG_CHEST_TOKEN` on the client.
- Keep Firebase Admin private key safe. If pasting into env, keep `\n` escapes.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
