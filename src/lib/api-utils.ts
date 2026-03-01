import { NextResponse } from 'next/server';

export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
  readonly skip: number;
}

export function getPagination(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function jsonResponse(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function cachedJsonResponse(data: unknown, maxAge = 300, sMaxAge = 600): NextResponse {
  const res = NextResponse.json(data);
  res.headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=60`);
  return res;
}

export function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** Case-insensitive search that works with Lithuanian characters (ą,č,ę,ė,į,š,ų,ū,ž) */
export function matchesSearch(value: string | null | undefined, query: string): boolean {
  if (!value) return false;
  return value.toLocaleLowerCase('lt').includes(query.toLocaleLowerCase('lt'));
}
