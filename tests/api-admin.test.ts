import { describe, it, expect, beforeAll } from 'vitest';
import { createClient, adminLogin, BASE } from './helpers';

const loginClient = createClient('10.0.4.1');
const unauthClient = createClient('10.0.4.2');

describe('POST /api/admin/login', () => {
  it('rejects wrong password', async () => {
    const { post } = createClient('10.0.4.10');
    const res = await post('/api/admin/login', { password: 'wrong_password' });
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('rejects missing password', async () => {
    const { post } = createClient('10.0.4.11');
    const res = await post('/api/admin/login', {});
    expect(res.status).toBe(400);
  });

  it('succeeds with correct password', async () => {
    const { post } = createClient('10.0.4.12');
    const res = await post('/api/admin/login', { password: 'darzeliai2026' });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('token');
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain('admin_token=');
  });
});

describe('Admin endpoints (authenticated)', () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await adminLogin('10.0.4.20');
    expect(adminToken).toBeTruthy();
  });

  function adminGet(path: string) {
    return fetch(`${BASE}${path}`, {
      headers: { Cookie: `admin_token=${adminToken}`, 'X-Forwarded-For': '10.0.4.21' },
    });
  }

  describe('GET /api/admin/stats', () => {
    it('returns comprehensive stats', async () => {
      const res = await adminGet('/api/admin/stats');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json).toHaveProperty('data');
      const data = json.data;
      expect(typeof data.kindergartenCount).toBe('number');
      expect(typeof data.reviewCount).toBe('number');
      expect(typeof data.pendingReviewCount).toBe('number');
    });
  });

  describe('GET /api/admin/reviews', () => {
    it('returns paginated reviews', async () => {
      const res = await adminGet('/api/admin/reviews?limit=5');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('reviews');
      expect(Array.isArray(json.reviews)).toBe(true);
      expect(json).toHaveProperty('pagination');
    });

    it('filters pending reviews', async () => {
      const res = await adminGet('/api/admin/reviews?pending=true&limit=5');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/admin/darzeliai', () => {
    it('returns paginated kindergartens', async () => {
      const res = await adminGet('/api/admin/darzeliai?limit=3');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('items');
      expect(json).toHaveProperty('total');
      expect(Array.isArray(json.items)).toBe(true);
    });

    it('supports search', async () => {
      const res = await adminGet('/api/admin/darzeliai?search=saulute&limit=5');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/admin/aukles', () => {
    it('returns paginated aukles', async () => {
      const res = await adminGet('/api/admin/aukles?limit=3');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('items');
      expect(json).toHaveProperty('total');
    });
  });

  describe('GET /api/admin/bureliai', () => {
    it('returns paginated bureliai', async () => {
      const res = await adminGet('/api/admin/bureliai?limit=3');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('items');
      expect(json).toHaveProperty('total');
    });
  });

  describe('GET /api/admin/specialistai', () => {
    it('returns paginated specialists', async () => {
      const res = await adminGet('/api/admin/specialistai?limit=3');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('items');
      expect(json).toHaveProperty('total');
    });
  });

  describe('GET /api/admin/forum', () => {
    it('returns forum posts list', async () => {
      const res = await adminGet('/api/admin/forum');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('posts');
      expect(Array.isArray(json.posts)).toBe(true);
    });
  });

  describe('GET /api/admin/export', () => {
    it('returns JSON export', async () => {
      const res = await adminGet('/api/admin/export?format=json');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('kindergartens');
    });

    it('returns CSV export', async () => {
      const res = await adminGet('/api/admin/export?format=csv');
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text.length).toBeGreaterThan(10);
    });
  });
});

describe('Admin endpoints without auth', () => {
  it('rejects GET /api/admin/stats without token', async () => {
    const res = await unauthClient.get('/api/admin/stats');
    expect([401, 403, 302, 307]).toContain(res.status);
  });

  it('rejects GET /api/admin/reviews without token', async () => {
    const res = await unauthClient.get('/api/admin/reviews');
    expect([401, 403, 302, 307]).toContain(res.status);
  });

  it('rejects GET /api/admin/darzeliai without token', async () => {
    const res = await unauthClient.get('/api/admin/darzeliai');
    expect([401, 403, 302, 307]).toContain(res.status);
  });
});
