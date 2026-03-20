import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { submissionSchema } from '@/lib/sanitize';
import { checkCsrf, checkHoneypot, checkSubmitTiming } from '@/lib/security';
import { checkRateLimitDb, RATE_LIMITS, getClientIp } from '@/lib/rate-limit';
import { verifyCaptcha } from '@/lib/captcha';

export async function POST(request: NextRequest) {
  // CSRF check
  const csrfError = checkCsrf(request);
  if (csrfError) return csrfError;

  // Rate limit (3 per hour)
  const rateLimitError = await checkRateLimitDb(request, RATE_LIMITS.SUBMISSION);
  if (rateLimitError) return rateLimitError;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Netinkamas užklausos formatas.' }, { status: 400 });
  }

  // Honeypot check
  const honeypotResult = checkHoneypot(body);
  if (honeypotResult) return honeypotResult;

  // Timing check
  const timingResult = checkSubmitTiming(body, 3);
  if (timingResult) return timingResult;

  // Captcha verification
  const captchaToken = typeof body.captchaToken === 'string' ? body.captchaToken : undefined;
  const captchaValid = await verifyCaptcha(captchaToken);
  if (!captchaValid) {
    return NextResponse.json({ error: 'Captcha patikrinimas nepavyko. Bandykite dar kartą.' }, { status: 400 });
  }

  // Validate with Zod
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstError?.message || 'Netinkami duomenys.' },
      { status: 400 },
    );
  }

  const {
    entityType,
    name,
    city,
    address,
    phone,
    email,
    website,
    description,
    submitterName,
    submitterEmail,
    submitterPhone,
    hours,
    experience,
    ageRange,
    category,
    specialty,
    clinic,
    price,
  } = parsed.data;

  // Build the data JSON with entity-specific fields
  const data: Record<string, string | undefined> = {
    name,
    city,
    address: address || undefined,
    phone: phone || undefined,
    email: email || undefined,
    website: website || undefined,
    description: description || undefined,
    hours: hours || undefined,
    experience: experience || undefined,
    ageRange: ageRange || undefined,
    category: category || undefined,
    specialty: specialty || undefined,
    clinic: clinic || undefined,
    price: price || undefined,
  };

  // Remove undefined values
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined),
  );

  try {
    const submission = await prisma.submission.create({
      data: {
        entityType,
        data: cleanData,
        submitterName,
        submitterEmail: submitterEmail || null,
        submitterPhone: submitterPhone || null,
        submitterIp: getClientIp(request),
        honeypotField: typeof body._hp_website === 'string' ? body._hp_website : null,
        captchaToken: captchaToken || null,
      },
    });

    // Send Telegram notification to admin (non-blocking)
    const typeLabels: Record<string, string> = {
      kindergarten: 'Darželis', aukle: 'Auklė', burelis: 'Būrelis', specialist: 'Specialistas',
    };
    const typeLabel = typeLabels[entityType] || entityType;
    const telegramMsg = [
      `📝 *Naujas pasiūlymas!*`,
      ``,
      `Tipas: ${typeLabel}`,
      `Pavadinimas: ${name}`,
      `Miestas: ${city}`,
      address ? `Adresas: ${address}` : '',
      ``,
      `Siūlytojas: ${submitterName}`,
      submitterEmail ? `El. paštas: ${submitterEmail}` : '',
      ``,
      `🔗 [Peržiūrėti admin](${process.env.NEXT_PUBLIC_SITE_URL || 'https://manovaikai.lt'}/admin/submissions)`,
    ].filter(Boolean).join('\n');

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_ADMIN_CHAT_ID) {
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_ADMIN_CHAT_ID,
          text: telegramMsg,
          parse_mode: 'Markdown',
        }),
      }).catch((e) => console.error('Telegram notification failed:', e));
    }

    return NextResponse.json({ success: true, id: submission.id }, { status: 201 });
  } catch (err) {
    console.error('Submission creation error:', err);
    return NextResponse.json({ error: 'Nepavyko išsaugoti pasiūlymo.' }, { status: 500 });
  }
}
