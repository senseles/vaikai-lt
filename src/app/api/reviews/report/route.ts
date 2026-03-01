import { NextRequest } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { checkRateLimit } from '@/lib/rate-limit';

/** Rate limit for report submissions: 3 requests per 60 seconds per IP */
const REPORT_RATE_LIMIT = {
  maxRequests: 3,
  windowSeconds: 60,
  identifier: 'review-report',
};

export async function POST(request: NextRequest) {
  // Rate limit to prevent spam
  const rateLimitResponse = checkRateLimit(request, REPORT_RATE_LIMIT);
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { reviewId, reason } = body as Record<string, unknown>;

  if (!reviewId || typeof reviewId !== 'string') {
    return errorResponse('reviewId is required and must be a string', 400);
  }

  if (reason !== undefined && typeof reason !== 'string') {
    return errorResponse('reason must be a string if provided', 400);
  }

  // TODO: Store in a Report table when implemented.
  // For now, report is acknowledged but not persisted beyond the review flag.

  return jsonResponse({ success: true, message: 'Report received' }, 200);
}
