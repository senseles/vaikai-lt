import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stripHtml } from '@/lib/security';

type Params = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = params;
  try {
    const body = await request.json();
    const rawText = body.text;

    if (!rawText || typeof rawText !== 'string') {
      return NextResponse.json({ success: false, error: 'Tekstas privalomas' }, { status: 400 });
    }

    const text = stripHtml(rawText.trim());
    if (text.length < 1 || text.length > 2000) {
      return NextResponse.json({ success: false, error: 'Tekstas turi būti 1-2000 simbolių' }, { status: 400 });
    }

    // Verify review exists
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ success: false, error: 'Atsiliepimas nerastas' }, { status: 404 });
    }

    const reply = await prisma.reviewReply.create({
      data: {
        reviewId: id,
        text,
        authorName: body.authorName || 'Administracija',
      },
    });

    return NextResponse.json({ success: true, data: reply }, { status: 201 });
  } catch (err) {
    console.error(`Reply to review/${id} error:`, err);
    return NextResponse.json({ success: false, error: 'Nepavyko išsaugoti atsakymo' }, { status: 500 });
  }
}
