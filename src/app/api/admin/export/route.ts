import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  try {
    const [kindergartens, aukles, bureliai, specialists, reviews] =
      await Promise.all([
        prisma.kindergarten.findMany(),
        prisma.aukle.findMany(),
        prisma.burelis.findMany(),
        prisma.specialist.findMany(),
        prisma.review.findMany(),
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

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="vaikai-export.csv"',
        },
      });
    }

    // Default: JSON format
    const data = {
      kindergartens,
      aukles,
      bureliai,
      specialists,
      reviews,
    };

    const jsonContent = JSON.stringify(data, null, 2);

    return new NextResponse(jsonContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="vaikai-export.json"',
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
