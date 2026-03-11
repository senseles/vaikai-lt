import { describe, it, expect } from 'vitest';
import { createClient } from './helpers';

const { get } = createClient('10.0.1.1');

describe('GET /api/cities', () => {
  it('returns array of Lithuanian cities', async () => {
    const res = await get('/api/cities');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    const city = data[0];
    expect(city).toHaveProperty('city');
    expect(city).toHaveProperty('kindergartens');
    const names = data.map((c: { city: string }) => c.city);
    expect(names).toContain('Vilnius');
    expect(names).toContain('Kaunas');
    expect(names).toContain('Klaipėda');
  });
});

describe('GET /api/kindergartens', () => {
  it('returns paginated list with city filter', async () => {
    const res = await get('/api/kindergartens?city=Vilnius&limit=5');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('data');
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data.length).toBeLessThanOrEqual(5);
    for (const k of json.data) {
      expect(k.city).toBe('Vilnius');
      expect(k).toHaveProperty('id');
      expect(k).toHaveProperty('slug');
      expect(k).toHaveProperty('name');
    }
  });

  it('returns empty data for nonexistent city', async () => {
    const res = await get('/api/kindergartens?city=FakeCity123');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(0);
  });

  it('supports pagination with page and limit', async () => {
    const res1 = await get('/api/kindergartens?limit=2&page=1');
    const res2 = await get('/api/kindergartens?limit=2&page=2');
    const json1 = await res1.json();
    const json2 = await res2.json();
    expect(json1.data.length).toBe(2);
    expect(json2.data.length).toBe(2);
    expect(json1.data[0].id).not.toBe(json2.data[0].id);
  });
});

describe('GET /api/kindergartens/[slug]', () => {
  it('returns single kindergarten by slug', async () => {
    const res = await get('/api/kindergartens/darzelis-mokykla-saulute');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('id');
    expect(json.slug).toBe('darzelis-mokykla-saulute');
    expect(json).toHaveProperty('name');
    expect(json).toHaveProperty('city');
  });

  it('returns 404 for nonexistent slug', async () => {
    const res = await get('/api/kindergartens/this-slug-does-not-exist-12345');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/aukles', () => {
  it('returns paginated list of nannies', async () => {
    const res = await get('/api/aukles?limit=3');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('data');
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    const aukle = json.data[0];
    expect(aukle).toHaveProperty('id');
    expect(aukle).toHaveProperty('slug');
    expect(aukle).toHaveProperty('name');
    expect(aukle).toHaveProperty('city');
  });
});

describe('GET /api/aukles/[slug]', () => {
  it('returns single aukle by slug', async () => {
    const res = await get('/api/aukles/agentura-aukle-aukle-lt');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.slug).toBe('agentura-aukle-aukle-lt');
  });

  it('returns 404 for nonexistent slug', async () => {
    const res = await get('/api/aukles/nonexistent-aukle-999');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/bureliai', () => {
  it('returns paginated list of clubs', async () => {
    const res = await get('/api/bureliai?limit=3');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('data');
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    const b = json.data[0];
    expect(b).toHaveProperty('id');
    expect(b).toHaveProperty('slug');
    expect(b).toHaveProperty('name');
  });
});

describe('GET /api/bureliai/[slug]', () => {
  it('returns single burelis by slug', async () => {
    const res = await get('/api/bureliai/alytaus-jaunimo-centras-bureliai');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.slug).toBe('alytaus-jaunimo-centras-bureliai');
  });

  it('returns 404 for nonexistent slug', async () => {
    const res = await get('/api/bureliai/nonexistent-burelis-999');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/specialists', () => {
  it('returns paginated list of specialists', async () => {
    const res = await get('/api/specialists?limit=3');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('data');
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    const s = json.data[0];
    expect(s).toHaveProperty('id');
    expect(s).toHaveProperty('slug');
    expect(s).toHaveProperty('name');
  });
});

describe('GET /api/specialists/[slug]', () => {
  it('returns single specialist by slug', async () => {
    const res = await get('/api/specialists/alytaus-vaiko-raidos-centras');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.slug).toBe('alytaus-vaiko-raidos-centras');
  });

  it('returns 404 for nonexistent slug', async () => {
    const res = await get('/api/specialists/nonexistent-specialist-999');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/search', () => {
  it('returns search suggestions for valid query', async () => {
    const res = await get('/api/search?q=vilnius');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('suggestions');
    expect(Array.isArray(json.suggestions)).toBe(true);
    expect(json.suggestions.length).toBeGreaterThan(0);
    expect(json.suggestions.length).toBeLessThanOrEqual(8);
  });

  it('handles single-char query gracefully', async () => {
    const res = await get('/api/search?q=a');
    // API may return 400 or 200 with empty results for very short queries
    expect([200, 400]).toContain(res.status);
  });

  it('returns empty suggestions for nonsense query', async () => {
    const res = await get('/api/search?q=xyznonexistent999');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.suggestions).toHaveLength(0);
  });
});

describe('GET /api/reviews', () => {
  it('returns reviews for valid item', async () => {
    const res = await get('/api/reviews?itemId=cmm7gsw2f0002wzk6i8srnmlp&itemType=kindergarten');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('returns 400 when missing params', async () => {
    const res = await get('/api/reviews');
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid itemType', async () => {
    const res = await get('/api/reviews?itemId=abc&itemType=invalid');
    expect(res.status).toBe(400);
  });
});
