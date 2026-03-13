import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/lib/api-utils';

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Netinkamas JSON formatas', 400);
  }

  const parsed = body as Record<string, unknown>;
  const { type, id, reason } = parsed;

  // Validate type
  if (!type || (type !== 'post' && type !== 'comment')) {
    return errorResponse('Tipas turi būti "post" arba "comment"', 400);
  }

  // Validate id
  if (!id || typeof id !== 'string') {
    return errorResponse('ID yra privalomas', 400);
  }

  // Validate reason (optional)
  if (reason !== undefined && typeof reason !== 'string') {
    return errorResponse('Priežastis turi būti tekstas', 400);
  }

  // Verify the target exists
  if (type === 'post') {
    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!post) {
      return errorResponse('Įrašas nerastas', 404);
    }
  } else {
    const comment = await prisma.forumComment.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!comment) {
      return errorResponse('Komentaras nerastas', 404);
    }
  }

  // Rate limit: same IP + same target within last hour
  const ip = getClientIp(request);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const existingReport = await prisma.forumReport.findFirst({
    where: {
      type: type as string,
      targetId: id,
      reporterIp: ip,
      createdAt: { gte: oneHourAgo },
    },
    select: { id: true },
  });

  if (existingReport) {
    return errorResponse('Jūs jau pranešėte apie šį turinį. Bandykite vėliau.', 429);
  }

  try {
    await prisma.forumReport.create({
      data: {
        type: type as string,
        targetId: id,
        reason: reason ? (reason as string).slice(0, 500) : null,
        reporterIp: ip,
      },
    });

    return jsonResponse({ success: true }, 201);
  } catch {
    return errorResponse('Nepavyko sukurti pranešimo', 500);
  }
}
