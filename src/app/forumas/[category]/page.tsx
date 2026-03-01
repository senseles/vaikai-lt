import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';

const CATEGORY_ICONS: Record<string, string> = {
  darzeliai: '🏫',
  aukles: '👩‍👧',
  bureliai: '🎨',
  specialistai: '👨‍⚕️',
  tevyste: '👨‍👩‍👧‍👦',
  mokyklos: '📚',
  sveikata: '🏥',
  laisvalaikis: '🎪',
};

type SortType = 'new' | 'top' | 'hot';

const SORT_LABELS: Record<SortType, string> = {
  new: 'Naujausi',
  top: 'Populiariausi',
  hot: 'Aktyviausi',
};

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
  params: { category: string };
  searchParams: { sort?: string; page?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = await prisma.forumCategory.findUnique({
    where: { slug: params.category },
  });

  if (!category) return {};

  return {
    title: `${category.name} — Tėvų forumas — Vaikai.lt`,
    description: category.description || `Diskusijos apie ${category.name.toLowerCase()} tėvų forume.`,
    alternates: {
      canonical: `/forumas/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const category = await prisma.forumCategory.findUnique({
    where: { slug: params.category },
  });

  if (!category) {
    notFound();
  }

  const sort: SortType = (['new', 'top', 'hot'].includes(searchParams.sort || '') ? searchParams.sort : 'new') as SortType;
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  // Determine ordering
  let orderBy: Record<string, string>[];
  switch (sort) {
    case 'top':
      orderBy = [{ isPinned: 'desc' }, { upvotes: 'desc' }, { createdAt: 'desc' }];
      break;
    case 'hot':
      orderBy = [{ isPinned: 'desc' }, { createdAt: 'desc' }];
      break;
    default:
      orderBy = [{ isPinned: 'desc' }, { createdAt: 'desc' }];
  }

  const where = { categoryId: category.id };

  let posts;
  let total: number;

  if (sort === 'hot') {
    // Fetch all and sort by hot score
    const allPosts = await prisma.forumPost.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        _count: { select: { comments: true } },
      },
    });

    const now = Date.now();
    const scored = allPosts.map((post) => {
      const ageHours = Math.max(1, (now - post.createdAt.getTime()) / 3_600_000);
      const score = (post.upvotes - post.downvotes) / ageHours;
      return { ...post, hotScore: score };
    });

    scored.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.hotScore - a.hotScore;
    });

    total = scored.length;
    posts = scored.slice(skip, skip + limit);
  } else {
    [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { name: true, slug: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.forumPost.count({ where }),
    ]);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      {/* Category Header */}
      <section className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl sm:text-4xl shrink-0" role="img" aria-hidden="true">
              {CATEGORY_ICONS[category.slug] || '💬'}
            </span>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          {/* Sort tabs + New post button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 sm:mt-6">
            {/* Sort tabs — scrollable on mobile */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1 overflow-x-auto scrollbar-none">
              {(Object.entries(SORT_LABELS) as [SortType, string][]).map(([key, label]) => (
                <Link
                  key={key}
                  href={`/forumas/${category.slug}?sort=${key}`}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[40px] flex items-center ${
                    sort === key
                      ? 'bg-white dark:bg-slate-600 text-[#2d6a4f] dark:text-green-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* New post button — full width on mobile for easy tapping */}
            <Link
              href="/forumas/naujas"
              className="inline-flex items-center justify-center gap-2 bg-[#2d6a4f] hover:bg-[#40916c] active:bg-[#1b4332] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm min-h-[48px] sm:min-h-[44px] w-full sm:w-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Sukurti naują įrašą
            </Link>
          </div>
        </div>
      </section>

      {/* Post List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg mb-4">
              Šioje kategorijoje dar nėra įrašų.
            </p>
            <Link
              href="/forumas/naujas"
              className="inline-flex items-center gap-2 bg-[#2d6a4f] hover:bg-[#40916c] text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm min-h-[48px]"
            >
              Būkite pirmas — sukurkite įrašą!
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => {
              const score = post.upvotes - post.downvotes;
              const commentCount = '_count' in post ? (post._count as { comments: number }).comments : 0;
              return (
                <Link
                  key={post.id}
                  href={`/forumas/${category.slug}/${post.slug}`}
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md active:shadow-sm transition-shadow border border-gray-100 dark:border-slate-700 group"
                >
                  {/* Vote count */}
                  <div className="flex flex-col items-center min-w-[2.5rem] sm:min-w-[3rem] pt-0.5 shrink-0">
                    <span className={`text-base sm:text-lg font-bold tabular-nums ${score > 0 ? 'text-green-600 dark:text-green-400' : score < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                      {score > 0 ? `+${score}` : score}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {post.isPinned && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full font-medium shrink-0">
                          Prisegtas
                        </span>
                      )}
                      <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-[#2d6a4f] dark:group-hover:text-green-400 transition-colors text-sm sm:text-base line-clamp-2 sm:line-clamp-1">
                        {post.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {post.content}
                    </p>
                    {/* Meta — wraps properly on mobile */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="truncate max-w-[100px] sm:max-w-none">{post.authorName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{timeAgo(post.createdAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {commentCount}
                      </span>
                      <span aria-hidden="true" className="hidden sm:inline">·</span>
                      <span className="hidden sm:flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.viewCount}
                      </span>
                      {post.city && (
                        <>
                          <span aria-hidden="true" className="hidden sm:inline">·</span>
                          <span className="hidden sm:flex items-center gap-1">
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
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination — touch-friendly */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
            {page > 1 && (
              <Link
                href={`/forumas/${category.slug}?sort=${sort}&page=${page - 1}`}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors min-h-[44px] flex items-center"
              >
                Ankstesnis
              </Link>
            )}
            <span className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/forumas/${category.slug}?sort=${sort}&page=${page + 1}`}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors min-h-[44px] flex items-center"
              >
                Kitas
              </Link>
            )}
          </div>
        )}
      </section>
    </>
  );
}
