/**
 * Server-side hCaptcha verification.
 * Uses HCAPTCHA_SECRET env var (test key: 0x0000000000000000000000000000000000000000).
 */

const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET || '0x0000000000000000000000000000000000000000';
const VERIFY_URL = 'https://hcaptcha.com/siteverify';

export async function verifyCaptcha(token: string | undefined | null): Promise<boolean> {
  // Skip verification in development if no secret configured
  if (!token) return false;

  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        response: token,
        secret: HCAPTCHA_SECRET,
      }),
    });

    const data = await res.json();
    return data.success === true;
  } catch {
    console.error('hCaptcha verification failed');
    return false;
  }
}
