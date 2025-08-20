import formatDateToMonthYear from '@/app/utils/formatDateToMonthYear';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const imgChestToken = process.env.NEXT_PUBLIC_IMG_CHEST_TOKEN;
  if (!imgChestToken) {
    return NextResponse.json({ error: 'Server misconfigured: NEXT_PUBLIC_IMG_CHEST_TOKEN missing' }, { status: 500 });
  }

 const npointId = process.env.NEXT_PUBLIC_NPOINT_ID;
  if (npointId ) {
    try {
      console.log(`Updating NPoint bin: ${npointId}`);
      // Get current data
      const npointRes = await fetch(`https://api.npoint.io/${npointId}`);
      let postIds: string[] = [];
      if (npointRes.ok) {
        const raw = await npointRes.json().catch(() => []);
        postIds = Array.isArray(raw) ? raw.filter((x: any) => typeof x === 'string') : [];

        // Fetch each ImgChest post, extract title and first image link
        const posts = await Promise.all(
          postIds.map(async (id) => {
            try {
              console.log(`Fetching ImgChest post: ${id}`);
              const res = await fetch(`https://api.imgchest.com/v1/post/${id}`, {
                // GET is appropriate for fetching a post resource
                headers: {
                  Authorization: `Bearer ${imgChestToken}`,
                  Accept: 'application/json',
                },
                cache: 'no-store',
              });

              if (!res.ok) {
                return { id, title: null, image: null, error: res.status };
              }

              const json = await res.json().catch(() => null);
              const data = json?.data;
              const title = data?.title ?? null;

              const images = Array.isArray(data?.images) ? data.images : [];
              const first = images
                .slice()
                .sort((a: any, b: any) => (a?.position ?? 0) - (b?.position ?? 0))[0] ?? images[0];

              const src = first?.link ?? null;
              const description = data?.description ?? null;
              const UnformattedDate = data?.created ?? null;
              const date = formatDateToMonthYear(UnformattedDate);

              return { title, src, description, date };
            } catch {
              return { title: null, src: null, description: null, date: null };
            }
          })
        );

        return NextResponse.json({ posts }, { status: 200 });
      } else {
        return NextResponse.json({ error: 'Failed to fetch NPoint bin', status: npointRes.status }, { status: 502 });
      }
      
    } catch (e) {
      console.error('Failed to fetch NPoint bin:', e);
      return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 });
    }
  } else {
    if (!npointId) console.warn('NPOINT_ID environment variable not set.');
    return NextResponse.json({ error: 'Server misconfigured: NEXT_PUBLIC_NPOINT_ID missing' }, { status: 500 });
  }
}

