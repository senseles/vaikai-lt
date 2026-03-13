import prisma from '@/lib/prisma';

export async function createNotification({
  userId,
  type,
  message,
  link,
}: {
  userId: string;
  type: string;
  message: string;
  link?: string;
}) {
  try {
    await prisma.notification.create({
      data: { userId, type, message, link },
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}
