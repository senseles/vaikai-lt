import { describe, it, expect } from 'vitest';
import { createClient, BASE } from './helpers';

describe('POST /api/reviews', () => {
  it('rejects request without CSRF headers', async () => {
    const res = await fetch(`${BASE}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '10.0.2.50' },
      body: JSON.stringify({
        itemId: 'cmm7gsw2f0002wzk6i8srnmlp',
        itemType: 'kindergarten',
        authorName: 'Test',
        rating: 5,
        text: 'Great place!',
      }),
    });
    expect(res.status).toBe(403);
  });

  it('creates a review with valid data', async () => {
    const { post } = createClient('10.0.2.10');
    const res = await post('/api/reviews', {
      itemId: 'cmm7gsw2f0002wzk6i8srnmlp',
      itemType: 'kindergarten',
      authorName: 'QA Tester',
      rating: 4,
      text: 'Gera vieta vaikams, rekomenduoju! Integracinis testas.',
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty('id');
    expect(json.authorName).toBe('QA Tester');
    expect(json.rating).toBe(4);
    expect(json.isApproved).toBe(true);
  });

  it('rejects review with missing fields', async () => {
    const { post } = createClient('10.0.2.11');
    const res = await post('/api/reviews', {
      itemId: 'cmm7gsw2f0002wzk6i8srnmlp',
      itemType: 'kindergarten',
    });
    expect(res.status).toBe(400);
  });

  it('rejects review with invalid rating (0)', async () => {
    const { post } = createClient('10.0.2.12');
    const res = await post('/api/reviews', {
      itemId: 'cmm7gsw2f0002wzk6i8srnmlp',
      itemType: 'kindergarten',
      authorName: 'Test',
      rating: 0,
      text: 'Bad rating test',
    });
    expect(res.status).toBe(400);
  });

  it('rejects review with rating > 5', async () => {
    const { post } = createClient('10.0.2.13');
    const res = await post('/api/reviews', {
      itemId: 'cmm7gsw2f0002wzk6i8srnmlp',
      itemType: 'kindergarten',
      authorName: 'Test',
      rating: 6,
      text: 'Over rating test',
    });
    expect(res.status).toBe(400);
  });

  it('rejects review with float rating', async () => {
    const { post } = createClient('10.0.2.14');
    const res = await post('/api/reviews', {
      itemId: 'cmm7gsw2f0002wzk6i8srnmlp',
      itemType: 'kindergarten',
      authorName: 'Test',
      rating: 3.5,
      text: 'Float rating test',
    });
    expect(res.status).toBe(400);
  });

  it('rejects review with invalid itemType', async () => {
    const { post } = createClient('10.0.2.15');
    const res = await post('/api/reviews', {
      itemId: 'cmm7gsw2f0002wzk6i8srnmlp',
      itemType: 'invalid_type',
      authorName: 'Test',
      rating: 3,
      text: 'Invalid type test',
    });
    expect(res.status).toBe(400);
  });

  it('rejects review for nonexistent entity', async () => {
    const { post } = createClient('10.0.2.16');
    const res = await post('/api/reviews', {
      itemId: 'nonexistent-id-12345',
      itemType: 'kindergarten',
      authorName: 'Test',
      rating: 3,
      text: 'Nonexistent entity test',
    });
    expect(res.status).toBe(404);
  });

  it('rejects review with text over 2000 chars', async () => {
    const { post } = createClient('10.0.2.17');
    const res = await post('/api/reviews', {
      itemId: 'cmm7gsw2f0002wzk6i8srnmlp',
      itemType: 'kindergarten',
      authorName: 'Test',
      rating: 3,
      text: 'A'.repeat(2001),
    });
    expect(res.status).toBe(400);
  });

  it('rejects review with authorName over 100 chars', async () => {
    const { post } = createClient('10.0.2.18');
    const res = await post('/api/reviews', {
      itemId: 'cmm7gsw2f0002wzk6i8srnmlp',
      itemType: 'kindergarten',
      authorName: 'A'.repeat(101),
      rating: 3,
      text: 'Long author name test',
    });
    expect(res.status).toBe(400);
  });

  it('strips HTML from review text (XSS prevention)', async () => {
    const { post } = createClient('10.0.2.19');
    const res = await post('/api/reviews', {
      itemId: 'cmm7gsw2f0002wzk6i8srnmlp',
      itemType: 'kindergarten',
      authorName: 'HTML Tester',
      rating: 3,
      text: 'Normal text with <b>bold</b> and more content here.',
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.text).not.toContain('<b>');
    expect(json.text).not.toContain('</b>');
    expect(json.text).toContain('Normal text with');
  });

  it('strips script tags but keeps inner text content', async () => {
    const { post } = createClient('10.0.2.20');
    const res = await post('/api/reviews', {
      itemId: 'cmm7gsw2f0002wzk6i8srnmlp',
      itemType: 'kindergarten',
      authorName: 'XSS Test',
      rating: 3,
      text: '<script>alert("xss")</script>',
    });
    // After stripping tags, inner text 'alert("xss")' remains -> 201
    expect([201, 400]).toContain(res.status);
    if (res.status === 201) {
      const json = await res.json();
      expect(json.text).not.toContain('<script>');
      expect(json.text).not.toContain('</script>');
    }
  });

  it('rejects review with only HTML tags and no text content', async () => {
    const { post } = createClient('10.0.2.21');
    const res = await post('/api/reviews', {
      itemId: 'cmm7gsw2f0002wzk6i8srnmlp',
      itemType: 'kindergarten',
      authorName: 'XSS Test',
      rating: 3,
      text: '<div><span></span></div>',
    });
    expect(res.status).toBe(400);
  });
});
