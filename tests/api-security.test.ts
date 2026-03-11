import { describe, it, expect } from 'vitest';
import { createClient, BASE } from './helpers';

// Each describe block gets its own IP range to avoid rate limits
const searchClient = createClient('10.0.3.1');
const sqliSearchClient = createClient('10.0.3.2');
const sqliKgClient = createClient('10.0.3.3');
const slugClient = createClient('10.0.3.4');

describe('Security: XSS payloads in search', () => {
  const xssPayloads = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1)>',
    '"><script>alert(document.cookie)</script>',
    "';DROP TABLE kindergartens;--",
    '<svg/onload=alert(1)>',
    'javascript:alert(1)',
  ];

  for (const payload of xssPayloads) {
    it(`search handles XSS payload: ${payload.slice(0, 40)}...`, async () => {
      const res = await searchClient.get(`/api/search?q=${encodeURIComponent(payload)}`);
      // Should either return 400 (short query) or 200 with safe results
      expect([200, 400]).toContain(res.status);
      if (res.status === 200) {
        const text = await res.text();
        expect(text).not.toContain('<script>');
        expect(text).not.toContain('onerror=');
      }
    });
  }
});

describe('Security: SQL injection in parameters', () => {
  const sqliPayloads = [
    "' OR '1'='1",
    "1; DROP TABLE kindergartens; --",
    "' UNION SELECT * FROM users --",
    "1' AND '1'='1",
    "'; EXEC xp_cmdshell('dir'); --",
  ];

  for (const payload of sqliPayloads) {
    it(`kindergartens handles SQLi: ${payload.slice(0, 40)}...`, async () => {
      const res = await sqliKgClient.get(`/api/kindergartens?city=${encodeURIComponent(payload)}`);
      expect([200, 400, 500]).toContain(res.status);
      if (res.status === 200) {
        const json = await res.json();
        expect(json).toHaveProperty('data');
      }
    });

    it(`search handles SQLi: ${payload.slice(0, 40)}...`, async () => {
      const res = await sqliSearchClient.get(`/api/search?q=${encodeURIComponent(payload)}`);
      expect([200, 400]).toContain(res.status);
    });
  }
});

describe('Security: SQL injection in slug endpoints', () => {
  const slugPayloads = [
    "' OR 1=1 --",
    "'; DROP TABLE--",
    "UNION SELECT password FROM users--",
  ];

  for (const payload of slugPayloads) {
    it(`kindergartens/[slug] handles SQLi: ${payload.slice(0, 30)}...`, async () => {
      const res = await slugClient.get(`/api/kindergartens/${encodeURIComponent(payload)}`);
      expect(res.status).toBe(404);
    });
  }
});

describe('Security: CSRF protection on POST endpoints', () => {
  it('rejects POST /api/reviews without CSRF headers', async () => {
    const res = await fetch(`${BASE}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '10.0.3.50' },
      body: JSON.stringify({
        itemId: 'test',
        itemType: 'kindergarten',
        authorName: 'Test',
        rating: 5,
        text: 'Test review',
      }),
    });
    expect(res.status).toBe(403);
  });

  it('rejects POST /api/reviews with wrong origin', async () => {
    const res = await fetch(`${BASE}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://evil-site.com',
        'X-Forwarded-For': '10.0.3.51',
      },
      body: JSON.stringify({
        itemId: 'test',
        itemType: 'kindergarten',
        authorName: 'Test',
        rating: 5,
        text: 'Test review',
      }),
    });
    expect(res.status).toBe(403);
  });

  it('allows POST with X-Requested-With header (AJAX)', async () => {
    const { post } = createClient('10.0.3.52');
    const res = await post('/api/reviews', {
      itemId: 'cmm7gsw2f0002wzk6i8srnmlp',
      itemType: 'kindergarten',
      authorName: 'CSRF Test',
      rating: 5,
      text: 'CSRF bypass test with XMLHttpRequest header',
    });
    // Should pass CSRF, may succeed or fail on validation but NOT 403
    expect(res.status).not.toBe(403);
  });
});

describe('Security: XSS in review author name', () => {
  it('strips HTML from author name', async () => {
    const { post } = createClient('10.0.3.60');
    const res = await post('/api/reviews', {
      itemId: 'cmm7gsw2f0002wzk6i8srnmlp',
      itemType: 'kindergarten',
      authorName: '<script>alert("xss")</script>Real Name',
      rating: 4,
      text: 'Testing XSS in author name field with enough text here.',
    });
    expect([201, 400]).toContain(res.status);
    if (res.status === 201) {
      const json = await res.json();
      expect(json.authorName).not.toContain('<script>');
    }
  });
});

describe('Security: oversized payloads', () => {
  it('handles very large query parameter gracefully', async () => {
    const { get } = createClient('10.0.3.70');
    const longQuery = 'A'.repeat(10000);
    const res = await get(`/api/search?q=${longQuery}`);
    // Should not crash - 200 or 400 or 429 are all acceptable
    expect([200, 400, 413, 414, 429]).toContain(res.status);
  });

  it('handles invalid JSON body', async () => {
    const res = await fetch(`${BASE}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Forwarded-For': '10.0.3.71',
      },
      body: 'not valid json{{{',
    });
    expect(res.status).toBe(400);
  });
});
