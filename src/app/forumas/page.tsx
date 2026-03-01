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

async function getForumData() {
  const [categories, topPosts] = await Promise.all([
    prisma.forumCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { posts: true } },
      },
    }),
    prisma.forumPost.findMany({
      orderBy: [{ upvotes: 'desc' }, { createdAt: 'desc' }],
      take: 10,
      include: {
        category: { select: { name: true, slug: true } },
        _count: { select: { comments: true } },
      },
    }),
  ]);

  return { categories, topPosts };
}

export default async function ForumPage() {
  const { categories, topPosts } = await getForumData();

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

      {/* Categories Grid — 1 col mobile, 2 col tablet, 4 col desktop */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-14">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-5 sm:mb-6">
          Kategorijos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/forumas/${cat.slug}`}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-5 group border border-gray-100 dark:border-slate-700 active:scale-[0.98]"
            >
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

      {/* Top Posts */}
      {topPosts.length > 0 && (
        <section className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-14">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-5 sm:mb-6">
              Populiariausi įrašai
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {topPosts.map((post) => {
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
