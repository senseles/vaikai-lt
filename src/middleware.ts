import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for admin API route protection.
 * All /api/admin/* routes (except /api/admin/login) require authentication.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip login route — it's public
  if (pathname === '/api/admin/login') {
    return NextResponse.next();
  }

  // Check for admin token in cookie or Authorization header
  const cookieToken = request.cookies.get('admin_token')?.value;
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = cookieToken || bearerToken;

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Neautorizuota. Prisijunkite.' },
      { status: 401 },
    );
  }

  // Token exists — allow through.
  // In production, validate token against DB/Redis here.
  return NextResponse.next();
}

export const config = {
  matcher: '/api/admin/:path*',
};
