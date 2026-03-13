import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { checkCsrf } from '@/lib/security';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  // CSRF protection
  const csrfResponse = checkCsrf(request);
  if (csrfResponse) return csrfResponse;

  // Rate limiting
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.NEWSLETTER);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const email = (body.email ?? '').trim().toLowerCase();

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Prašome įvesti galiojantį el. pašto adresą.' },
        { status: 400 },
      );
    }

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { success: true, data: { message: 'Jau prenumeruojate' } },
          { status: 200 },
        );
      }

      // Reactivate
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { isActive: true, unsubscribedAt: null },
      });

      return NextResponse.json(
        { success: true, data: { message: 'Prenumerata sėkmingai atnaujinta!' } },
        { status: 200 },
      );
    }

    await prisma.newsletterSubscriber.create({
      data: { email },
    });

    return NextResponse.json(
      { success: true, data: { message: 'Prenumerata patvirtinta!' } },
      { status: 201 },
    );
  } catch (error) {
    console.error('Newsletter POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Serverio klaida. Bandykite vėliau.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  // CSRF protection
  const csrfResponse = checkCsrf(request);
  if (csrfResponse) return csrfResponse;

  try {
    const body = await request.json();
    const email = (body.email ?? '').trim().toLowerCase();

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Prašome įvesti galiojantį el. pašto adresą.' },
        { status: 400 },
      );
    }

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!existing || !existing.isActive) {
      return NextResponse.json(
        { success: false, error: 'El. paštas nerastas prenumeratorių sąraše.' },
        { status: 404 },
      );
    }

    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { isActive: false, unsubscribedAt: new Date() },
    });

    return NextResponse.json(
      { success: true, data: { message: 'Prenumerata atšaukta.' } },
      { status: 200 },
    );
  } catch (error) {
    console.error('Newsletter DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Serverio klaida. Bandykite vėliau.' },
      { status: 500 },
    );
  }
}
