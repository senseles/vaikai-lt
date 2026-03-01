import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

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

  const reviews = await prisma.review.findMany({
    where: { itemId, itemType, isApproved: true },
    orderBy: { createdAt: 'desc' },
  });

  return jsonResponse(reviews);
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

  const { itemId, itemType, authorName, rating, text } = body as Record<string, unknown>;

  if (!itemId || typeof itemId !== 'string') {
    return errorResponse('itemId is required and must be a string', 400);
  }
  if (!itemType || !VALID_ITEM_TYPES.includes(itemType as typeof VALID_ITEM_TYPES[number])) {
    return errorResponse(`itemType must be one of: ${VALID_ITEM_TYPES.join(', ')}`, 400);
  }
  if (!authorName || typeof authorName !== 'string' || authorName.trim().length === 0) {
    return errorResponse('authorName is required', 400);
  }
  if (rating == null || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return errorResponse('rating must be a number between 1 and 5', 400);
  }
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return errorResponse('text is required', 400);
  }

  const review = await prisma.review.create({
    data: {
      itemId: itemId as string,
      itemType: itemType as string,
      authorName: stripHtml((authorName as string).trim()),
      rating: rating as number,
      text: stripHtml((text as string).trim()),
      isApproved: false,
    },
  });

  return jsonResponse(review, 201);
}
