import { NextRequest, NextResponse } from 'next/server';

/**
 * Shared security utilities for API routes.
 * Provides CSRF protection and honeypot/timing-based bot detection.
 */

const SITE_HOSTNAME = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
  : 'vaikai.lt';

/**
 * Verify the request Origin/Referer matches the expected site.
 * Also accepts requests with X-Requested-With: XMLHttpRequest (AJAX).
 * Returns a 403 response if the check fails, or null if OK.
 */
export function checkCsrf(request: NextRequest): NextResponse | null {
  // Allow requests with the custom AJAX header (browsers prevent cross-origin
  // requests from setting custom headers without a CORS preflight)
  const xRequestedWith = request.headers.get('x-requested-with');
  if (xRequestedWith === 'XMLHttpRequest') {
    return null;
  }

  // Check Origin header first (set by browsers on POST requests)
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      const originHost = new URL(origin).hostname;
      if (originHost === SITE_HOSTNAME || originHost === 'localhost' || originHost === '127.0.0.1' || originHost.endsWith('.trycloudflare.com') || originHost.endsWith('.netlify.app')) {
        return null;
      }
    } catch {
      // Invalid URL in Origin header
    }
    return NextResponse.json(
      { error: 'Užklausa atmesta — netinkama kilmė.' },
      { status: 403 },
    );
  }

  // Fall back to Referer header
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererHost = new URL(referer).hostname;
      if (refererHost === SITE_HOSTNAME || refererHost === 'localhost' || refererHost === '127.0.0.1' || refererHost.endsWith('.trycloudflare.com') || refererHost.endsWith('.netlify.app')) {
        return null;
      }
    } catch {
      // Invalid URL in Referer header
    }
    return NextResponse.json(
      { error: 'Užklausa atmesta — netinkama kilmė.' },
      { status: 403 },
    );
  }

  // If neither Origin nor Referer is present, reject for safety
  // (legitimate browser requests always include at least one)
  return NextResponse.json(
    { error: 'Užklausa atmesta — trūksta kilmės antraštės.' },
    { status: 403 },
  );
}

/**
 * Honeypot check: if the hidden field `_hp_website` has any content,
 * the submission is from a bot. Return a fake success response (200)
 * so the bot doesn't know it was caught.
 */
export function checkHoneypot(body: Record<string, unknown>): NextResponse | null {
  const honeypot = body._hp_website;
  if (honeypot && typeof honeypot === 'string' && honeypot.trim().length > 0) {
    // Silently reject — return 200 so bots think it succeeded
    return NextResponse.json({ success: true, id: 'ok' }, { status: 200 });
  }
  return null;
}

/**
 * Timing check: if the form was submitted within `minSeconds` of the
 * provided timestamp, it's likely a bot. The frontend should set
 * `_form_loaded_at` to `Date.now()` when the form mounts.
 *
 * Returns a 400 error if too fast, or null if OK.
 */
export function checkSubmitTiming(body: Record<string, unknown>, minSeconds = 3): NextResponse | null {
  const loadedAt = body._form_loaded_at;
  if (typeof loadedAt === 'number' && loadedAt > 0) {
    const elapsed = (Date.now() - loadedAt) / 1000;
    if (elapsed < minSeconds) {
      return NextResponse.json(
        { error: 'Per greitas pateikimas. Palaukite kelias sekundes.' },
        { status: 400 },
      );
    }
  }
  // If _form_loaded_at is not present, skip the check (backwards compatible)
  return null;
}

/** Strip HTML tags from user input to prevent stored XSS */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}
