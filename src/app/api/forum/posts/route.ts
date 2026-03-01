import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse, getPagination } from '@/lib/api-utils';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

/** Strip HTML tags from user input to prevent stored XSS */
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/** Generate a URL-safe slug from a Lithuanian title */
function slugify(text: string): string {
  const map: Record<string, string> = {
    'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i',
    'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z',
    'Ą': 'a', 'Č': 'c', 'Ę': 'e', 'Ė': 'e', 'Į': 'i',
    'Š': 's', 'Ų': 'u', 'Ū': 'u', 'Ž': 'z',
  };

  return text
    .toLowerCase()
    .split('')
    .map((ch) => map[ch] || ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.PUBLIC_GET);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = getPagination(searchParams);
    const categorySlug = searchParams.get('category');
    const sort = searchParams.get('sort') || 'new';
    const search = searchParams.get('search');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (categorySlug) {
      const category = await prisma.forumCategory.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
      });
      if (!category) {
        return errorResponse('Kategorija nerasta', 404);
      }
      where.categoryId = category.id;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    // Determine ordering
    let orderBy: Record<string, string>[];
    switch (sort) {
      case 'top':
        orderBy = [{ upvotes: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'hot':
        // For "hot" we need custom sorting — fetch and sort in JS
        break;
      default: // 'new'
        orderBy = [{ isPinned: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    if (sort === 'hot') {
      // Fetch all matching posts, score them, then paginate
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

      // Pinned posts first, then by hot score
      scored.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.hotScore - a.hotScore;
      });

      const total = scored.length;
      const paginated = scored.slice(skip, skip + limit);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const data = paginated.map(({ hotScore: _hs, _count, ...post }) => ({
        ...post,
        commentCount: _count.comments,
      }));

      return jsonResponse({
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy!,
        include: {
          category: { select: { name: true, slug: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.forumPost.count({ where }),
    ]);

    const data = posts.map(({ _count, ...post }) => ({
      ...post,
      commentCount: _count.comments,
    }));

    return jsonResponse({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return errorResponse('Vidinė serverio klaida', 500);
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.REVIEW_POST);
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Netinkamas JSON formatas', 400);
  }

  const { title: rawTitle, content: rawContent, authorName: rawAuthor, categorySlug, city } =
    body as Record<string, unknown>;

  // Validate categorySlug
  if (!categorySlug || typeof categorySlug !== 'string') {
    return errorResponse('Kategorija yra privaloma', 400);
  }
  const category = await prisma.forumCategory.findUnique({
    where: { slug: categorySlug },
    select: { id: true },
  });
  if (!category) {
    return errorResponse('Kategorija nerasta', 404);
  }

  // Validate title
  if (!rawTitle || typeof rawTitle !== 'string') {
    return errorResponse('Pavadinimas yra privalomas', 400);
  }
  const cleanTitle = stripHtml(rawTitle.trim());
  if (cleanTitle.length < 5) {
    return errorResponse('Pavadinimas turi būti bent 5 simbolių', 400);
  }
  if (cleanTitle.length > 200) {
    return errorResponse('Pavadinimas negali viršyti 200 simbolių', 400);
  }

  // Validate content
  if (!rawContent || typeof rawContent !== 'string') {
    return errorResponse('Turinys yra privalomas', 400);
  }
  const cleanContent = stripHtml(rawContent.trim());
  if (cleanContent.length < 10) {
    return errorResponse('Turinys turi būti bent 10 simbolių', 400);
  }
  if (cleanContent.length > 5000) {
    return errorResponse('Turinys negali viršyti 5000 simbolių', 400);
  }

  // Validate authorName
  if (!rawAuthor || typeof rawAuthor !== 'string') {
    return errorResponse('Autoriaus vardas yra privalomas', 400);
  }
  const cleanAuthor = stripHtml(rawAuthor.trim());
  if (cleanAuthor.length < 2) {
    return errorResponse('Autoriaus vardas turi būti bent 2 simbolių', 400);
  }
  if (cleanAuthor.length > 50) {
    return errorResponse('Autoriaus vardas negali viršyti 50 simbolių', 400);
  }

  // Validate city (optional)
  let cleanCity: string | null = null;
  if (city && typeof city === 'string') {
    cleanCity = stripHtml(city.trim()) || null;
  }

  // Generate unique slug
  let baseSlug = slugify(cleanTitle);
  if (!baseSlug) baseSlug = 'irasas';
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const existing = await prisma.forumPost.findUnique({ where: { slug }, select: { id: true } });
    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  try {
    const post = await prisma.forumPost.create({
      data: {
        title: cleanTitle,
        slug,
        content: cleanContent,
        authorName: cleanAuthor,
        categoryId: category.id,
        city: cleanCity,
      },
      include: {
        category: { select: { name: true, slug: true } },
      },
    });

    return jsonResponse(post, 201);
  } catch {
    return errorResponse('Nepavyko sukurti įrašo', 500);
  }
}
