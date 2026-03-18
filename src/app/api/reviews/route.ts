import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { notifyNewReview } from '@/lib/notifications';
import { checkCsrf, checkHoneypot, checkSubmitTiming } from '@/lib/security';
import { sanitizeString } from '@/lib/sanitize';
import { verifyCaptcha } from '@/lib/captcha';

const VALID_ITEM_TYPES = ['kindergarten', 'aukle', 'burelis', 'specialist'] as const;

function getEntityModel(type: string) {
  switch (type) {
    case 'kindergarten': return prisma.kindergarten;
    case 'aukle': return prisma.aukle;
    case 'burelis': return prisma.burelis;
    case 'specialist': return prisma.specialist;
    default: return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const itemId = searchParams.get('itemId');
  const itemType = searchParams.get('itemType');

  if (!itemId || !itemType) {
    return errorResponse('itemId and itemType are required', 400);
  }

  if (!VALID_ITEM_TYPES.includes(itemType as typeof VALID_ITEM_TYPES[number])) {
    return errorResponse(`itemType must be one of: ${VALID_ITEM_TYPES.join(', ')}`, 400);
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { itemId, itemType, isApproved: true },
      orderBy: { createdAt: 'desc' },
      include: { replies: { orderBy: { createdAt: 'asc' } } },
    });

    return jsonResponse(reviews);
  } catch {
    return errorResponse('Vidine serverio klaida', 500);
  }
}

export async function POST(request: NextRequest) {
  // CSRF protection
  const csrfResponse = checkCsrf(request);
  if (csrfResponse) return csrfResponse;

  // Auth is optional — anonymous users can submit with CAPTCHA
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  // Rate limiting by userId or IP
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.REVIEW_POST, userId ?? undefined);
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const parsed = body as Record<string, unknown>;

  // Honeypot check — bots fill hidden fields
  const honeypotResponse = checkHoneypot(parsed);
  if (honeypotResponse) return honeypotResponse;

  // Timing check — reject submissions faster than 3 seconds
  const timingResponse = checkSubmitTiming(parsed, 3);
  if (timingResponse) return timingResponse;

  // hCaptcha verification
  const captchaValid = await verifyCaptcha(parsed.captchaToken as string | undefined);
  if (!captchaValid) {
    return errorResponse('CAPTCHA patikrinimas nepavyko', 400);
  }

  const { itemId, itemType, authorName: rawAuthor, rating, text: rawText } = parsed;

  if (!itemId || typeof itemId !== 'string') {
    return errorResponse('itemId is required and must be a string', 400);
  }
  if (!itemType || !VALID_ITEM_TYPES.includes(itemType as typeof VALID_ITEM_TYPES[number])) {
    return errorResponse(`itemType must be one of: ${VALID_ITEM_TYPES.join(', ')}`, 400);
  }

  // Verify the referenced entity exists
  const entityModel = getEntityModel(itemType as string);
  if (!entityModel) return errorResponse('Netinkamas tipas', 400);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma union delegate types incompatible
  const entityExists = await (entityModel as any).findUnique({
    where: { id: itemId as string },
    select: { id: true },
  });
  if (!entityExists) {
    return errorResponse('Nurodytas objektas nerastas', 404);
  }

  // Check 1 review per user per entity (only for logged-in users)
  if (userId) {
    const existingReview = await prisma.review.findFirst({
      where: { userId, itemId: itemId as string, itemType: itemType as string },
    });
    if (existingReview) {
      return errorResponse('Jūs jau palikote atsiliepimą šiam objektui', 409);
    }
  }

  if (!rawAuthor || typeof rawAuthor !== 'string') {
    return errorResponse('authorName is required', 400);
  }
  if (rating == null || typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return errorResponse('rating must be an integer between 1 and 5', 400);
  }
  if (!rawText || typeof rawText !== 'string') {
    return errorResponse('text is required', 400);
  }

  // Sanitize BEFORE validation — DOMPurify strips all HTML
  const cleanAuthor = sanitizeString(rawAuthor);
  const cleanText = sanitizeString(rawText);

  if (cleanAuthor.length === 0) {
    return errorResponse('authorName is required', 400);
  }
  if (cleanText.length === 0) {
    return errorResponse('text is required', 400);
  }
  if (cleanText.length > 2000) {
    return errorResponse('text must be 2000 characters or less', 400);
  }
  if (cleanAuthor.length > 100) {
    return errorResponse('authorName must be 100 characters or less', 400);
  }

  try {
    const review = await prisma.review.create({
      data: {
        itemId: itemId as string,
        itemType: itemType as string,
        authorName: cleanAuthor,
        rating: rating as number,
        text: cleanText,
        isApproved: false,
        userId: userId ?? undefined,
      },
    });

    // Send email notification to admin (non-blocking)
    notifyNewReview({
      authorName: review.authorName,
      rating: review.rating,
      text: review.text,
      itemType: review.itemType,
      itemId: review.itemId,
    }).catch(() => {});

    return jsonResponse({ ...review, message: 'Jūsų atsiliepimas bus paskelbtas po peržiūros' }, 201);
  } catch {
    return errorResponse('Nepavyko išsaugoti atsiliepimo', 500);
  }
}
