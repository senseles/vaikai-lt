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

const LT_MAP: Record<string, string> = {
  'ą':'a','č':'c','ę':'e','ė':'e','į':'i','š':'s','ų':'u','ū':'u','ž':'z',
  'Ą':'A','Č':'C','Ę':'E','Ė':'E','Į':'I','Š':'S','Ų':'U','Ū':'U','Ž':'Z',
  '„':'','\u201c':'','\u201d':'',
};
function stripLt(s: string): string {
  return s.replace(/[ąčęėįšųūžĄČĘĖĮŠŲŪŽ„""]/g, ch => LT_MAP[ch] ?? ch);
}

/** Case-insensitive search that works with Lithuanian characters (ą,č,ę,ė,į,š,ų,ū,ž) */
export function matchesSearch(value: string | null | undefined, query: string): boolean {
  if (!value) return false;
  const v = value.toLocaleLowerCase('lt');
  const q = query.toLocaleLowerCase('lt');
  // Match both with and without diacritics
  return v.includes(q) || stripLt(v).includes(stripLt(q));
}
