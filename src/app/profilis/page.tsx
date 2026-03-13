'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  loginMethod: string;
}

interface UserReview {
  id: string;
  itemId: string;
  itemType: string;
  authorName: string;
  rating: number;
  text: string;
  isApproved: boolean;
  createdAt: string;
}

interface ForumPost {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  upvotes: number;
  createdAt: string;
}

const ITEM_TYPE_LABELS: Record<string, string> = {
  kindergarten: 'Darželis',
  aukle: 'Auklė',
  burelis: 'Būrelis',
  specialist: 'Specialistas',
};

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'reviews' | 'forum'>('reviews');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/prisijungti');
      return;
    }
    if (status !== 'authenticated') return;

    fetch('/api/user')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setProfile(data.user);
          setReviews(data.reviews);
          setForumPosts(data.forumPosts);
          setNewName(data.user.name || '');
        }
      })
      .finally(() => setLoading(false));
  }, [status, router]);

  const saveName = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        setProfile(prev => prev ? { ...prev, name: newName } : prev);
        setEditingName(false);
        setMessage('Vardas atnaujintas');
        setTimeout(() => setMessage(''), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Ar tikrai norite ištrinti savo paskyrą? Šis veiksmas negrįžtamas. Visi jūsų duomenys bus pašalinti.')) return;
    if (!confirm('Paskutinis patvirtinimas: paskyra bus ištrinta visam laikui.')) return;

    const res = await fetch('/api/user', { method: 'DELETE' });
    if (res.ok) {
      signOut({ callbackUrl: '/' });
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-48" />
          <div className="h-32 bg-gray-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Pradžia</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">Profilis</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Mano profilis</h1>

      {message && (
        <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
          {message}
        </div>
      )}

      {/* Profile info card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {profile.name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  maxLength={100}
                  autoFocus
                />
                <button onClick={saveName} disabled={saving || !newName.trim()} className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 font-medium">
                  {saving ? '...' : 'Išsaugoti'}
                </button>
                <button onClick={() => { setEditingName(false); setNewName(profile.name || ''); }} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  Atšaukti
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{profile.name || 'Vartotojas'}</h2>
                <button onClick={() => setEditingName(true)} className="text-xs text-primary hover:text-primary-dark transition-colors" title="Redaguoti vardą">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-400 dark:text-gray-500">
              <span>Registracija: {new Date(profile.createdAt).toLocaleDateString('lt-LT')}</span>
              <span>Prisijungimas: {profile.loginMethod}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 text-sm rounded-md font-medium transition-all ${activeTab === 'reviews' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
        >
          Atsiliepimai ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('forum')}
          className={`px-4 py-2 text-sm rounded-md font-medium transition-all ${activeTab === 'forum' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
        >
          Forumo įrašai ({forumPosts.length})
        </button>
      </div>

      {/* Reviews tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
              <p className="text-gray-400 dark:text-gray-500 text-sm">Dar neturite atsiliepimų</p>
            </div>
          ) : reviews.map(r => (
            <div key={r.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400">
                    {ITEM_TYPE_LABELS[r.itemType] || r.itemType}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.isApproved ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                    {r.isApproved ? 'Patvirtintas' : 'Laukia patvirtinimo'}
                  </span>
                </div>
                <time className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('lt-LT')}</time>
              </div>
              <div className="flex items-center gap-0.5 mb-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`text-sm ${i < r.rating ? 'text-yellow-500' : 'text-gray-200 dark:text-gray-600'}`}>★</span>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Forum tab */}
      {activeTab === 'forum' && (
        <div className="space-y-3">
          {forumPosts.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
              <p className="text-gray-400 dark:text-gray-500 text-sm">Dar neturite forumo įrašų</p>
            </div>
          ) : forumPosts.map(p => (
            <Link key={p.id} href={`/forumas/${p.slug}`} className="block bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 hover:border-primary/30 transition-colors">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">{p.title}</h3>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span>{new Date(p.createdAt).toLocaleDateString('lt-LT')}</span>
                <span>+{p.upvotes} balsų</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Delete account */}
      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Pavojinga zona</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Ištrynus paskyrą, visi jūsų duomenys bus pašalinti negrįžtamai.</p>
        <button
          onClick={deleteAccount}
          className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 font-medium transition-colors"
        >
          Ištrinti paskyrą
        </button>
      </div>
    </div>
  );
}
