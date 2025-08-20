'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { auth } from '../firebaseClient';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, getIdToken } from 'firebase/auth';

export default function AdminPage() {
  const [user, setUser] = useState<null | { email: string; idToken: string }>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u?.email && u.email === adminEmail) {
        const token = await getIdToken(u, true);
        setUser({ email: u.email, idToken: token });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [adminEmail]);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken();
    if (result.user.email !== adminEmail) {
      await signOut(auth);
      alert('Access denied');
      return;
    }
    setUser({ email: result.user.email!, idToken: token });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!files || files.length === 0) {
      alert('Select at least one image');
      return;
    }

    const fd = new FormData();
    if (title) fd.append('title', title);
    if (description) fd.append('description', description);
    Array.from(files).forEach((f) => fd.append('images[]', f));

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.idToken}`,
      },
      body: fd,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(`Upload failed: ${JSON.stringify(err)}`);
      return;
    }

    const data = await res.json();
    alert('Upload successful');
    console.log('ImgChest response', data);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user)
    return (
      <div className="p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Admin Login</h1>
        <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={signIn}>
          Sign in with Google
        </button>
      </div>
    );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">ImgChest Uploader</h1>
        <button className="px-3 py-1 rounded bg-gray-200" onClick={() => signOut(auth)}>
          Sign out
        </button>
      </div>
      <form onSubmit={handleUpload} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Optional title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded p-2"
        />
        <textarea
          placeholder="Optional description for all images"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded p-2"
        />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="border rounded p-2"
        />
        <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">
          Upload to ImgChest
        </button>
      </form>
    </div>
  );
}
