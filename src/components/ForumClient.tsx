'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';

// ===== Session ID =====
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('forum_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('forum_session_id', id);
  }
  return id;
}

// ===== Time Ago =====
function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'ką tik';
  if (diffMin < 60) return `prieš ${diffMin} min.`;
  if (diffHours < 24) return `prieš ${diffHours} val.`;
  if (diffDays < 7) return `prieš ${diffDays} d.`;
  if (diffDays < 30) return `prieš ${Math.floor(diffDays / 7)} sav.`;
  return d.toLocaleDateString('lt-LT');
}

// ===== Vote Button =====
interface VoteButtonsProps {
  postId?: string;
  commentId?: string;
  upvotes: number;
  downvotes: number;
}

export function VoteButtons({ postId, commentId, upvotes, downvotes }: VoteButtonsProps) {
  const [up, setUp] = useState(upvotes);
  const [down, setDown] = useState(downvotes);
  const [myVote, setMyVote] = useState<1 | -1 | null>(null);
  const [loading, setLoading] = useState(false);

  const score = up - down;

  const vote = async (value: 1 | -1) => {
    if (loading) return;
    setLoading(true);

    try {
      const sessionId = getSessionId();
      const res = await fetch('/api/forum/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, commentId, sessionId, value }),
      });

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.action === 'removed') {
        // Vote was toggled off
        if (value === 1) setUp((prev) => prev - 1);
        else setDown((prev) => prev - 1);
        setMyVote(null);
      } else if (data.action === 'changed') {
        // Vote was changed
        if (value === 1) {
          setUp((prev) => prev + 1);
          setDown((prev) => prev - 1);
        } else {
          setUp((prev) => prev - 1);
          setDown((prev) => prev + 1);
        }
        setMyVote(value);
      } else {
        // New vote
        if (value === 1) setUp((prev) => prev + 1);
        else setDown((prev) => prev + 1);
        setMyVote(value);
      }
    } catch {
      // Ignore errors silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => vote(1)}
        disabled={loading}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
          myVote === 1
            ? 'bg-green-100 dark:bg-green-900/40 text-[#2d6a4f] dark:text-green-400'
            : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-400'
        }`}
        aria-label="Balsuoti už"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <span className={`text-sm font-bold ${score > 0 ? 'text-[#2d6a4f] dark:text-green-400' : score < 0 ? 'text-red-500' : 'text-slate-500'}`}>
        {score}
      </span>
      <button
        onClick={() => vote(-1)}
        disabled={loading}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
          myVote === -1
            ? 'bg-red-100 dark:bg-red-900/40 text-red-500'
            : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-400'
        }`}
        aria-label="Balsuoti prieš"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}

// ===== Comment Tree =====
interface CommentData {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  authorName: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  replies: CommentData[];
}

interface CommentProps {
  comment: CommentData;
  depth: number;
  postId: string;
  onCommentAdded: () => void;
}

function Comment({ comment, depth, postId, onCommentAdded }: CommentProps) {
  const [showReply, setShowReply] = useState(false);

  return (
    <div className={`${depth > 0 ? 'ml-4 sm:ml-8 border-l-2 border-gray-200 dark:border-slate-700 pl-4' : ''}`}>
      <div className="flex items-start gap-3 py-3">
        <VoteButtons commentId={comment.id} upvotes={comment.upvotes} downvotes={comment.downvotes} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{comment.authorName}</span>
            <span aria-hidden="true">·</span>
            <time>{timeAgo(comment.createdAt)}</time>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          {depth < 2 && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#2d6a4f] dark:hover:text-green-400 mt-2 font-medium transition-colors"
            >
              {showReply ? 'Atšaukti' : 'Atsakyti'}
            </button>
          )}
          {showReply && (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onSubmit={() => {
                  setShowReply(false);
                  onCommentAdded();
                }}
                compact
              />
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              postId={postId}
              onCommentAdded={onCommentAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Comment Form =====
interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSubmit?: () => void;
  compact?: boolean;
}

function CommentForm({ postId, parentId, onSubmit, compact }: CommentFormProps) {
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Restore saved author name
  useEffect(() => {
    const saved = localStorage.getItem('forum_author_name');
    if (saved) setAuthorName(saved);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (authorName.trim().length < 2) {
      setError('Vardas turi būti bent 2 simbolių');
      return;
    }
    if (content.trim().length < 2) {
      setError('Komentaras turi būti bent 2 simbolių');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/forum/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          parentId: parentId || undefined,
          authorName: authorName.trim(),
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Nepavyko pridėti komentaro');
        setSubmitting(false);
        return;
      }

      // Save author name for reuse
      localStorage.setItem('forum_author_name', authorName.trim());
      setContent('');
      onSubmit?.();
    } catch {
      setError('Tinklo klaida. Bandykite dar kartą.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${compact ? '' : 'bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700'}`}>
      {!compact && (
        <h3 className="font-semibold text-slate-800 dark:text-white">Pridėti komentarą</h3>
      )}
      <div className={compact ? 'flex gap-2' : ''}>
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Jūsų vardas"
          maxLength={50}
          className={`${compact ? 'w-1/3' : 'w-full'} px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] dark:focus:ring-green-400 placeholder:text-slate-400`}
        />
        {compact && (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Jūsų atsakymas..."
            maxLength={2000}
            rows={2}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] dark:focus:ring-green-400 resize-none placeholder:text-slate-400"
          />
        )}
      </div>
      {!compact && (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Rašykite komentarą..."
          maxLength={2000}
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] dark:focus:ring-green-400 resize-none placeholder:text-slate-400"
        />
      )}
      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#2d6a4f] hover:bg-[#40916c] disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {submitting ? 'Siunčiama...' : compact ? 'Atsakyti' : 'Komentuoti'}
        </button>
      </div>
    </form>
  );
}

// ===== Comment Section (entire wrapper) =====
interface CommentSectionProps {
  postId: string;
  initialComments: CommentData[];
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments] = useState<CommentData[]>(initialComments);

  // Reload the page to get fresh comments after adding
  const handleCommentAdded = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <CommentForm postId={postId} onSubmit={handleCommentAdded} />

      {/* Comments */}
      <div>
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
          Komentarai ({countComments(comments)})
        </h3>
        {comments.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm py-4">
            Dar nėra komentarų. Būkite pirmas!
          </p>
        ) : (
          <div className="space-y-1">
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                depth={0}
                postId={postId}
                onCommentAdded={handleCommentAdded}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function countComments(comments: CommentData[]): number {
  let count = 0;
  for (const c of comments) {
    count += 1 + countComments(c.replies);
  }
  return count;
}
