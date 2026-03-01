import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/lib/api-utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const item = await prisma.aukle.findUnique({ where: { slug: params.slug } });
  if (!item) return errorResponse('Aukle not found', 404);
  return jsonResponse(item);
}
