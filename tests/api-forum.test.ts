import { describe, it, expect } from 'vitest';
import { createClient } from './helpers';

const client = createClient('10.0.5.1');
const postClient = createClient('10.0.5.2');

describe('GET /api/forum/categories', () => {
  it('returns array of categories', async () => {
    const res = await client.get('/api/forum/categories');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    if (json.length > 0) {
      expect(json[0]).toHaveProperty('name');
      expect(json[0]).toHaveProperty('slug');
    }
  });
});

describe('GET /api/forum/posts', () => {
  it('returns paginated posts', async () => {
    const res = await client.get('/api/forum/posts?limit=5');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('data');
    expect(Array.isArray(json.data)).toBe(true);
    expect(json).toHaveProperty('pagination');
  });

  it('supports sort parameter', async () => {
    const res = await client.get('/api/forum/posts?sort=top&limit=3');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('data');
  });

  it('supports category filter', async () => {
    const catRes = await client.get('/api/forum/categories');
    const categories = await catRes.json();
    if (categories.length > 0) {
      const slug = categories[0].slug;
      const res = await client.get(`/api/forum/posts?category=${slug}&limit=3`);
      expect(res.status).toBe(200);
    }
  });

  it('supports search', async () => {
    const { get } = createClient('10.0.5.3');
    const res = await get('/api/forum/posts?search=darželis&limit=3');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('data');
  });
});

describe('GET /api/forum/posts/[slug]', () => {
  it('returns post with comments when exists', async () => {
    const { get } = createClient('10.0.5.4');
    const listRes = await get('/api/forum/posts?limit=1');
    const listJson = await listRes.json();
    if (listJson.data && listJson.data.length > 0) {
      const slug = listJson.data[0].slug;
      const res = await get(`/api/forum/posts/${slug}`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('title');
      expect(json).toHaveProperty('comments');
    }
  });

  it('returns 404 for nonexistent post', async () => {
    const { get } = createClient('10.0.5.5');
    const res = await get('/api/forum/posts/this-post-does-not-exist-999');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/forum/vote', () => {
  it('rejects vote without required fields', async () => {
    const res = await postClient.post('/api/forum/vote', {});
    expect(res.status).toBe(400);
  });

  it('rejects vote with invalid sessionId format', async () => {
    const { post } = createClient('10.0.5.6');
    const res = await post('/api/forum/vote', {
      postId: 'some-id',
      sessionId: 'not-a-uuid',
      value: 1,
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/reviews/report', () => {
  it('rejects report without reviewId', async () => {
    const { post } = createClient('10.0.5.7');
    const res = await post('/api/reviews/report', {});
    expect(res.status).toBe(400);
  });

  it('accepts valid report', async () => {
    const { get, post } = createClient('10.0.5.8');
    const reviewsRes = await get('/api/reviews?itemId=cmm7gsw2f0002wzk6i8srnmlp&itemType=kindergarten');
    const reviews = await reviewsRes.json();
    if (Array.isArray(reviews) && reviews.length > 0) {
      const res = await post('/api/reviews/report', {
        reviewId: reviews[0].id,
        reason: 'Test report from QA',
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    }
  });
});
