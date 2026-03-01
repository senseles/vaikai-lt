import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  try {
    // Select only essential fields to reduce payload size
    const [kindergartens, aukles, bureliai, specialists, reviews] =
      await Promise.all([
        prisma.kindergarten.findMany({
          select: { id: true, name: true, city: true, type: true, address: true, phone: true, website: true, language: true, hours: true, ageFrom: true, groups: true, description: true, baseRating: true, baseReviewCount: true },
        }),
        prisma.aukle.findMany({
          select: { id: true, name: true, city: true, phone: true, email: true, experience: true, ageRange: true, hourlyRate: true, languages: true, availability: true, description: true, baseRating: true, baseReviewCount: true },
        }),
        prisma.burelis.findMany({
          select: { id: true, name: true, city: true, category: true, subcategory: true, ageRange: true, price: true, schedule: true, phone: true, website: true, description: true, baseRating: true, baseReviewCount: true },
        }),
        prisma.specialist.findMany({
          select: { id: true, name: true, city: true, specialty: true, clinic: true, price: true, phone: true, website: true, languages: true, description: true, baseRating: true, baseReviewCount: true },
        }),
        prisma.review.findMany({
          select: { id: true, itemId: true, itemType: true, authorName: true, rating: true, text: true, isApproved: true, createdAt: true },
        }),
      ]);

    if (format === 'csv') {
      const allColumns = new Set<string>();
      allColumns.add('type');

      const taggedRows: Record<string, unknown>[] = [];

      const addRows = (items: Record<string, unknown>[], type: string) => {
        for (const item of items) {
          const row: Record<string, unknown> = { type };
          for (const key of Object.keys(item)) {
            allColumns.add(key);
            row[key] = item[key];
          }
          taggedRows.push(row);
        }
      };

      addRows(kindergartens as unknown as Record<string, unknown>[], 'kindergarten');
      addRows(aukles as unknown as Record<string, unknown>[], 'aukle');
      addRows(bureliai as unknown as Record<string, unknown>[], 'burelis');
      addRows(specialists as unknown as Record<string, unknown>[], 'specialist');
      addRows(reviews as unknown as Record<string, unknown>[], 'review');

      const columns = Array.from(allColumns);

      const escapeCsvValue = (value: unknown): string => {
        if (value === null || value === undefined) return '';
        const str = value instanceof Date ? value.toISOString() : String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const headerLine = columns.map(escapeCsvValue).join(',');
      const dataLines = taggedRows.map((row) =>
        columns.map((col) => escapeCsvValue(row[col])).join(',')
      );
      const csvContent = [headerLine, ...dataLines].join('\n');
      const csvBuffer = new TextEncoder().encode(csvContent);

      return new NextResponse(csvBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="vaikai-export.csv"',
          'Content-Length': String(csvBuffer.byteLength),
        },
      });
    }

    // Default: JSON format — use compact encoding to reduce size
    const data = { kindergartens, aukles, bureliai, specialists, reviews };
    const jsonContent = JSON.stringify(data);
    const jsonBuffer = new TextEncoder().encode(jsonContent);

    return new NextResponse(jsonBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="vaikai-export.json"',
        'Content-Length': String(jsonBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
