import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { VoteButtons, CommentSection, AuthorAvatar } from '@/components/ForumClient';
import type { Metadata } from 'next';

interface CommentNode {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  authorName: string;
  authorId: string | null;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  replies: CommentNode[];
}

function buildCommentTree(
  comments: Array<{
    id: string;
    postId: string;
    parentId: string | null;
    content: string;
    authorName: string;
    authorId: string | null;
    upvotes: number;
    downvotes: number;
    createdAt: Date;
  }>,
): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const c of comments) {
    map.set(c.id, {
      ...c,
      createdAt: c.createdAt.toISOString(),
      replies: [],
    });
  }

  for (const c of comments) {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  // Limit to 3 levels
  function trimDepth(nodes: CommentNode[], depth: number): CommentNode[] {
    if (depth >= 3) {
      return nodes.map((n) => ({ ...n, replies: [] }));
    }
    return nodes.map((n) => ({
      ...n,
      replies: trimDepth(n.replies, depth + 1),
    }));
  }

  return trimDepth(roots, 1);
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'ką tik';
  if (diffMin < 60) return `prieš ${diffMin} min.`;
  if (diffHours < 24) return `prieš ${diffHours} val.`;
  if (diffDays < 7) return `prieš ${diffDays} d.`;
  if (diffDays < 30) return `prieš ${Math.floor(diffDays / 7)} sav.`;
  return date.toLocaleDateString('lt-LT');
}

interface PageProps {
  params: { category: string; slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await prisma.forumPost.findUnique({
    where: { slug: params.slug },
    include: { category: { select: { name: true } } },
  });

  if (!post) return {};

  const title = `${post.title} — Tėvų forumas — Vaikai.lt`;
  const description = post.content.slice(0, 160);
  const url = `https://vaikai.lt/forumas/${params.category}/${params.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Vaikai.lt',
      type: 'article',
      locale: 'lt_LT',
      publishedTime: post.createdAt?.toISOString(),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const post = await prisma.forumPost.findUnique({
    where: { slug: params.slug },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!post || post.category.slug !== params.category) {
    notFound();
  }

  // Increment view count (non-blocking)
  prisma.forumPost.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => { /* view count update failure should not block page render */ });

  const commentTree = buildCommentTree(post.comments);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-10">
      {/* Back link — 44px touch target */}
      <Link
        href={`/forumas/${post.category.slug}`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-[#2d6a4f] dark:hover:text-green-400 transition-colors mb-4 sm:mb-6 min-h-[44px]"
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="truncate">Atgal į {post.category.name}</span>
      </Link>

      {/* Post */}
      <article className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Vote buttons — hidden on mobile, shown on sm+ */}
            <div className="hidden sm:block shrink-0">
              <VoteButtons postId={post.id} upvotes={post.upvotes} downvotes={post.downvotes} disabled={post.isLocked} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Category badge + pinned + locked */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
                <Link
                  href={`/forumas/${post.category.slug}`}
                  className="bg-green-50 dark:bg-green-900/30 text-[#2d6a4f] dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                >
                  {post.category.name}
                </Link>
                {post.isPinned && (
                  <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full text-xs font-medium">
                    Prisegtas
                  </span>
                )}
                {post.isLocked && (
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Užrakintas
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white mb-3 break-words">
                {post.title}
              </h1>

              {/* Meta with author avatar — stacks on very narrow screens */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 sm:mb-5">
                <span className="inline-flex items-center gap-1.5">
                  <AuthorAvatar name={post.authorName} size="sm" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{post.authorName}</span>
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <time>{timeAgo(post.createdAt)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.viewCount} peržiūrų</span>
                  {post.city && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {post.city}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Mobile vote buttons — shown only on mobile */}
              <div className="sm:hidden mb-4">
                <VoteButtons postId={post.id} upvotes={post.upvotes} downvotes={post.downvotes} disabled={post.isLocked} />
              </div>

              {/* Content */}
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-[0.95rem] leading-relaxed whitespace-pre-wrap break-words">
                {post.content}
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="mt-6 sm:mt-8">
        {post.isLocked ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-center">
            <p className="text-yellow-700 dark:text-yellow-400 text-sm font-medium flex items-center justify-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Šis įrašas yra užrakintas — nauji komentarai negalimi.
            </p>
          </div>
        ) : (
          <CommentSection postId={post.id} initialComments={commentTree} />
        )}
      </div>
    </div>
  );
}
