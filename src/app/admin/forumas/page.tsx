'use client';

import { useState, useEffect, useCallback } from 'react';

interface ForumPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorName: string;
  categoryName: string;
  city: string | null;
  upvotes: number;
  downvotes: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  commentCount: number;
  createdAt: string;
}

interface ForumComment {
  id: string;
  content: string;
  authorName: string;
  postTitle: string;
  postId: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

type ActiveTab = 'posts' | 'comments';

export default function AdminForumas() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('posts');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/forum');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/forum/comments');
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'posts') loadPosts();
    else loadComments();
  }, [activeTab, loadPosts, loadComments]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  };

  // Post actions
  const togglePin = async (id: string, currentValue: boolean) => {
    try {
      const res = await fetch('/api/admin/forum', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isPinned: !currentValue }),
      });
      if (!res.ok) throw new Error();
      showMessage('success', currentValue ? 'Įrašas atsegtas' : 'Įrašas prisegtas');
      loadPosts();
    } catch {
      showMessage('error', 'Nepavyko atnaujinti įrašo');
    }
  };

  const toggleLock = async (id: string, currentValue: boolean) => {
    try {
      const res = await fetch('/api/admin/forum', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isLocked: !currentValue }),
      });
      if (!res.ok) throw new Error();
      showMessage('success', currentValue ? 'Įrašas atrakintas' : 'Įrašas užrakintas');
      loadPosts();
    } catch {
      showMessage('error', 'Nepavyko atnaujinti įrašo');
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Ar tikrai norite ištrinti šį forumo įrašą? Bus ištrintos ir visos diskusijos.')) return;
    try {
      const res = await fetch('/api/admin/forum', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      showMessage('success', 'Forumo įrašas ištrintas');
      loadPosts();
    } catch {
      showMessage('error', 'Nepavyko ištrinti forumo įrašo');
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm('Ar tikrai norite ištrinti šį komentarą?')) return;
    try {
      const res = await fetch('/api/admin/forum/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      showMessage('success', 'Komentaras ištrintas');
      loadComments();
    } catch {
      showMessage('error', 'Nepavyko ištrinti komentaro');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Forumas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Moderuokite forumo įrašus ir komentarus</p>
      </div>

      {/* Messages */}
      {actionMessage && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm flex items-center justify-between ${
          actionMessage.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="opacity-50 hover:opacity-100 ml-2">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
            activeTab === 'posts' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Įrašai
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
            activeTab === 'comments' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Komentarai
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'posts' ? (
        /* Posts list */
        posts.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
            <p className="text-gray-400 dark:text-gray-500 text-sm">Nėra forumo įrašų</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Pavadinimas</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Kategorija</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Autorius</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Balsai</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Koment.</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden lg:table-cell">Data</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Būsena</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Veiksmai</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post, index) => (
                    <tr
                      key={post.id}
                      className={`border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                        index % 2 === 1 ? 'bg-gray-50/50 dark:bg-slate-900/20' : 'bg-white dark:bg-slate-800'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900 dark:text-gray-100 block truncate max-w-xs">
                          {post.isPinned && <span className="text-[#2d6a4f] mr-1" title="Prisegtas">&#x1F4CC;</span>}
                          {post.isLocked && <span className="text-gray-400 dark:text-gray-500 mr-1" title="Užrakintas">&#x1F512;</span>}
                          {post.title}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                          {post.categoryName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{post.authorName}</td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="text-green-600 dark:text-green-400 text-xs">+{post.upvotes}</span>
                        {' / '}
                        <span className="text-red-500 dark:text-red-400 text-xs">-{post.downvotes}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 hidden sm:table-cell">{post.commentCount}</td>
                      <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs hidden lg:table-cell">
                        {new Date(post.createdAt).toLocaleDateString('lt-LT')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {post.isPinned && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">Prisegtas</span>
                          )}
                          {post.isLocked && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400 font-medium">Užrakintas</span>
                          )}
                          {!post.isPinned && !post.isLocked && (
                            <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => togglePin(post.id, post.isPinned)}
                          className="text-xs text-[#2d6a4f] hover:text-[#40916c] dark:text-[#52b788] dark:hover:text-[#74c69d] font-medium mr-2 transition-colors"
                          title={post.isPinned ? 'Atsegti' : 'Prisegti'}
                        >
                          {post.isPinned ? 'Atsegti' : 'Prisegti'}
                        </button>
                        <button
                          onClick={() => toggleLock(post.id, post.isLocked)}
                          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium mr-2 transition-colors"
                          title={post.isLocked ? 'Atrakinti' : 'Užrakinti'}
                        >
                          {post.isLocked ? 'Atrakinti' : 'Užrakinti'}
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
                        >
                          Ištrinti
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Comments list */
        comments.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
            <p className="text-gray-400 dark:text-gray-500 text-sm">Nėra komentarų</p>
          </div>
        ) : (
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{comment.authorName}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">→</span>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate max-w-[200px]">{comment.postTitle}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString('lt-LT', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-xs">
                        <span className="text-green-600 dark:text-green-400">+{comment.upvotes}</span>
                        {' / '}
                        <span className="text-red-500 dark:text-red-400">-{comment.downvotes}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="px-3 py-1.5 text-xs bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 font-medium transition-colors flex-shrink-0"
                  >
                    Ištrinti
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
