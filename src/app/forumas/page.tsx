import Link from 'next/link';
import prisma from '@/lib/prisma';

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
  searchParams: { q?: string; view?: string };
}

export default async function ForumPage({ searchParams }: PageProps) {
  const searchQuery = searchParams.q?.trim() || '';
  const view = searchParams.view || '';

  const categories = await prisma.forumCategory.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { posts: true } } },
  });

  const postInclude = {
    category: { select: { name: true, slug: true } },
    _count: { select: { comments: true } },
  } as const;

  // Determine which posts to show and section title
  let displayPosts: Awaited<ReturnType<typeof prisma.forumPost.findMany<{ include: typeof postInclude }>>>;
  let sectionTitle: string;
  let isSearch = false;
  let noResults = false;

  if (searchQuery.length >= 2) {
    // Search mode
    isSearch = true;
    displayPosts = await prisma.forumPost.findMany({
      where: {
        OR: [
          { title: { contains: searchQuery } },
          { content: { contains: searchQuery } },
        ],
      },
      orderBy: [{ upvotes: 'desc' }, { createdAt: 'desc' }],
      take: 30,
      include: postInclude,
    });
    sectionTitle = `Paieškos rezultatai (${displayPosts.length})`;
    noResults = displayPosts.length === 0;
  } else if (view === 'naujausi' || view === 'populiariausi') {
    // View mode: all posts sorted
    displayPosts = await prisma.forumPost.findMany({
      orderBy: view === 'populiariausi'
        ? [{ upvotes: 'desc' }, { createdAt: 'desc' }]
        : [{ createdAt: 'desc' }],
      take: 30,
      include: postInclude,
    });
    sectionTitle = view === 'naujausi' ? 'Naujausi įrašai' : 'Populiariausi įrašai';
  } else {
    // Default: top posts for the home view
    displayPosts = await prisma.forumPost.findMany({
      orderBy: [{ upvotes: 'desc' }, { createdAt: 'desc' }],
      take: 10,
      include: postInclude,
    });
    sectionTitle = 'Populiariausi įrašai';
  }

  const showCategories = !isSearch && view !== 'naujausi' && view !== 'populiariausi';

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2d6a4f] to-[#40916c] py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 md:mb-4">
            Tėvų forumas
          </h1>
          <p className="text-green-100 text-base sm:text-lg max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed">
            Klauskite, dalinkitės patirtimi ir gaukite patarimų iš kitų tėvelių.
            Diskusijos apie darželius, aukles, būrelius ir vaikų auginimą.
          </p>
          {/* Forum search bar */}
          <form action="/forumas" method="GET" className="max-w-xl mx-auto mb-6">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Ieškoti forume..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 border-0 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
              />
            </div>
          </form>

          <Link
            href="/forumas/naujas"
            className="inline-flex items-center gap-2 bg-white text-[#2d6a4f] font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-lg min-h-[48px] text-sm sm:text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Sukurti naują įrašą
          </Link>
        </div>
      </section>

      {/* No search results */}
      {noResults && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400 text-base mb-2">
              Nerasta rezultatų pagal &bdquo;{searchQuery}&ldquo;
            </p>
            <Link href="/forumas" className="text-[#2d6a4f] dark:text-green-400 font-medium hover:underline text-sm">
              Grįžti į forumą
            </Link>
          </div>
        </section>
      )}

      {/* Categories Grid — hide when searching or viewing all */}
      {showCategories && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-14">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-5 sm:mb-6">
          Kategorijos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/forumas/${cat.slug}`}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all p-4 sm:p-5 group border border-gray-100 dark:border-slate-700 active:scale-[0.98] hover:border-green-200 dark:hover:border-green-800 relative"
            >
              {/* Post count badge */}
              {cat._count.posts > 0 && (
                <span className="absolute top-3 right-3 bg-[#2d6a4f]/10 dark:bg-green-900/30 text-[#2d6a4f] dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {cat._count.posts}
                </span>
              )}
              <div className="flex items-start gap-3">
                <span className="text-2xl sm:text-3xl shrink-0" role="img" aria-hidden="true">
                  {CATEGORY_ICONS[cat.slug] || '💬'}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-[#2d6a4f] dark:group-hover:text-green-400 transition-colors text-sm sm:text-base">
                    {cat.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                    {cat._count.posts} {cat._count.posts === 1 ? 'įrašas' : cat._count.posts < 10 ? 'įrašai' : 'įrašų'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      )}

      {/* Posts Section */}
      {displayPosts.length > 0 && (
        <section className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-14">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-5 sm:mb-6">
              {sectionTitle}
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {displayPosts.map((post) => {
                const score = post.upvotes - post.downvotes;
                return (
                  <Link
                    key={post.id}
                    href={`/forumas/${post.category.slug}/${post.slug}`}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group active:bg-gray-100 dark:active:bg-slate-700"
                  >
                    {/* Vote count */}
                    <div className="flex flex-col items-center min-w-[2.5rem] sm:min-w-[3rem] pt-0.5 shrink-0">
                      <span className={`text-base sm:text-lg font-bold tabular-nums ${score > 0 ? 'text-green-600 dark:text-green-400' : score < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                        {score > 0 ? `+${score}` : score}
                      </span>
                      <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">balsai</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-[#2d6a4f] dark:group-hover:text-green-400 transition-colors text-sm sm:text-base line-clamp-2 sm:line-clamp-1">
                        {post.title}
                      </h3>
                      {/* Meta — wraps naturally, stacks on very narrow */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="bg-green-50 dark:bg-green-900/30 text-[#2d6a4f] dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                          {post.category.name}
                        </span>
                        <span className="truncate max-w-[120px]">{post.authorName}</span>
                        <span aria-hidden="true" className="hidden sm:inline">·</span>
                        <span>{timeAgo(post.createdAt)}</span>
                        <span aria-hidden="true" className="hidden sm:inline">·</span>
                        <span>{post._count.comments} koment.</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
