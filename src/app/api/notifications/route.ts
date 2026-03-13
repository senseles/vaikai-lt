import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/api-utils';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as { id?: string }).id) {
    return errorResponse('Neprisijungęs', 401);
  }
  const userId = (session.user as { id: string }).id;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return jsonResponse({ notifications, unreadCount });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as { id?: string }).id) {
    return errorResponse('Neprisijungęs', 401);
  }
  const userId = (session.user as { id: string }).id;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Netinkamas JSON', 400);
  }

  if (body.markAllRead === true) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return jsonResponse({ success: true });
  }

  if (typeof body.id === 'string') {
    await prisma.notification.updateMany({
      where: { id: body.id, userId },
      data: { isRead: true },
    });
    return jsonResponse({ success: true });
  }

  return errorResponse('Netinkama užklausa', 400);
}
