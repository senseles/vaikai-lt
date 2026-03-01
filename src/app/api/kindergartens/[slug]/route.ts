import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { cachedJsonResponse, errorResponse } from '@/lib/api-utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const item = await prisma.kindergarten.findUnique({ where: { slug: params.slug } });
  if (!item) return errorResponse('Kindergarten not found', 404);
  let features: string[] = [];
  try { features = JSON.parse(item.features); } catch { /* invalid JSON fallback */ }
  return cachedJsonResponse({ ...item, features }, 300, 3600);
}
