import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { notifyNewReview } from '@/lib/notifications';

const VALID_ITEM_TYPES = ['kindergarten', 'aukle', 'burelis', 'specialist'] as const;

/** Strip HTML tags from user input to prevent stored XSS */
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
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
    });

    return jsonResponse(reviews);
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
    return errorResponse('Invalid JSON body', 400);
  }

  const { itemId, itemType, authorName: rawAuthor, rating, text: rawText } = body as Record<string, unknown>;

  if (!itemId || typeof itemId !== 'string') {
    return errorResponse('itemId is required and must be a string', 400);
  }
  if (!itemType || !VALID_ITEM_TYPES.includes(itemType as typeof VALID_ITEM_TYPES[number])) {
    return errorResponse(`itemType must be one of: ${VALID_ITEM_TYPES.join(', ')}`, 400);
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

  // Sanitize BEFORE validation — prevents empty-content reviews from XSS payloads
  const cleanAuthor = stripHtml(rawAuthor.trim());
  const cleanText = stripHtml(rawText.trim());

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
      },
    });

    // Send email notification to admin (non-blocking)
    notifyNewReview({
      authorName: review.authorName,
      rating: review.rating,
      text: review.text,
      itemType: review.itemType,
      itemId: review.itemId,
    }).catch(() => { /* notification failure should not block review creation */ });

    return jsonResponse(review, 201);
  } catch {
    return errorResponse('Nepavyko išsaugoti atsiliepimo', 500);
  }
}
