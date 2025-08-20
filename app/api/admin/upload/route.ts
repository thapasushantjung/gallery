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

  const imgChestToken = process.env.IMG_CHEST_TOKEN;
  if (!imgChestToken) {
    return NextResponse.json({ error: 'Server misconfigured: IMG_CHEST_TOKEN missing' }, { status: 500 });
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
  return NextResponse.json(data);
}
