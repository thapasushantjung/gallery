export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const idToken = authHeader.split(' ')[1];
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (decoded.email && decoded.email === adminEmail) return decoded;
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  // Auth check
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Parse multipart/form-data
  const formData = await req.formData();
  const title = formData.get('title')?.toString() ?? '';
  const files = formData.getAll('images[]');

  if (!files.length) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }
  if (files.length > 20) {
    return NextResponse.json({ error: 'Max 20 files allowed' }, { status: 400 });
  }

  const imgChestToken = process.env.NEXT_PUBLIC_IMG_CHEST_TOKEN;
  if (!imgChestToken) {
    return NextResponse.json({ error: 'Server misconfigured: NEXT_PUBLIC_IMG_CHEST_TOKEN missing' }, { status: 500 });
  }

  // Build FormData to forward to ImgChest
  const upstream = new FormData();
  if (title) upstream.append('title', title);

  for (const f of files) {
    if (typeof f === 'string') continue; // ignore strings
    upstream.append('images[]', f as unknown as File);
  }

  // Send to ImgChest
  const res = await fetch('https://api.imgchest.com/v1/post', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${imgChestToken}`,
    },
    body: upstream,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json({ error: 'Upload failed', details: data }, { status: res.status });
  }
   // NPoint integration
  const npointId = process.env.NEXT_PUBLIC_NPOINT_ID;
  if (npointId && data.data?.id) {
    try {
      console.log(`Updating NPoint bin: ${npointId}`);
      // Get current data
      const npointRes = await fetch(`https://api.npoint.io/${npointId}`);
      let postIds: string[] = [];
      if (npointRes.ok) {
        postIds = await npointRes.json().catch(() => []);
      }
      
      // Add new post ID if it's not already there
      if (!postIds.includes(data.data.id)) {
        postIds.push(data.data.id);

        // Save back to NPoint
        await fetch(`https://api.npoint.io/${npointId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postIds),
        });
        console.log(`Successfully updated NPoint with new post ID: ${data.data.id}`);
      } else {
        console.log(`Post ID ${data.data.id} already exists in NPoint bin.`);
      }
    } catch (e) {
      console.error('Failed to update NPoint bin:', e);
      // Do not fail the whole request if npoint update fails
    }
  } else {
    if (!npointId) console.warn('NPOINT_ID environment variable not set.');
    if (!data.data?.id) console.warn('No post ID in ImgChest response.');
  }
  return NextResponse.json(data);
}
