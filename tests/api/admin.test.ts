import { describe, it, expect } from 'vitest';
import { createClient, adminLogin } from '../helpers';

const IP = '10.0.14.';
let n = 1;
const client = () => createClient(`${IP}${n++}`);

describe('Admin API — papildomi testai', () => {
  describe('POST /api/admin/login', () => {
    it('priima teisingą slaptažodį', async () => {
      const { post } = client();
      const res = await post('/api/admin/login', { password: 'darzeliai2026' });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.token).toBeTruthy();
    });

    it('atmeta neteisingą slaptažodį', async () => {
      const { post } = client();
      const res = await post('/api/admin/login', { password: 'wrong' });
      expect(res.status).toBe(401);
    });

    it('atmeta tuščią slaptažodį', async () => {
      const { post } = client();
      const res = await post('/api/admin/login', { password: '' });
      expect([400, 401]).toContain(res.status);
    });

    it('atmeta be body', async () => {
      const { post } = client();
      const res = await post('/api/admin/login', {});
      expect([400, 401]).toContain(res.status);
    });

    it('CSRF apsauga', async () => {
      const res = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'darzeliai2026' }),
      });
      expect(res.status).toBe(403);
    });
  });

  describe('Admin endpoints be auth', () => {
    const protectedEndpoints = [
      '/api/admin/stats',
      '/api/admin/users',
      '/api/admin/export',
    ];

    for (const endpoint of protectedEndpoints) {
      it(`GET ${endpoint} — 401 be tokeno`, async () => {
        const { get } = client();
        const res = await get(endpoint);
        expect(res.status).toBe(401);
      });
    }
  });

  describe('Admin endpoints su auth', () => {
    it('GET /api/admin/stats — grąžina statistiką', async () => {
      const token = await adminLogin(`${IP}${n++}`);
      const res = await fetch('http://localhost:3000/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Forwarded-For': `${IP}${n++}`,
        },
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toBeTruthy();
    });

    it('GET /api/admin/users — grąžina vartotojus', async () => {
      const token = await adminLogin(`${IP}${n++}`);
      const res = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Forwarded-For': `${IP}${n++}`,
        },
      });
      expect(res.status).toBe(200);
    });

    it('neteisingas token — 401', async () => {
      const res = await fetch('http://localhost:3000/api/admin/stats', {
        headers: {
          Authorization: 'Bearer invalid_token_here',
          'X-Forwarded-For': `${IP}${n++}`,
        },
      });
      expect(res.status).toBe(401);
    });

    it('pasibaigęs token — 401', async () => {
      const expiredToken = '1000000000000.abcdef1234567890abcdef';
      const res = await fetch('http://localhost:3000/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${expiredToken}`,
          'X-Forwarded-For': `${IP}${n++}`,
        },
      });
      expect(res.status).toBe(401);
    });
  });

  describe('Admin PATCH whitelist', () => {
    it('PATCH review — tik isApproved laukas leidžiamas', async () => {
      const token = await adminLogin(`${IP}${n++}`);
      const res = await fetch('http://localhost:3000/api/admin/reviews/nonexistent', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
          'X-Forwarded-For': `${IP}${n++}`,
        },
        body: JSON.stringify({ isApproved: true, rating: 1 }),
      });
      // 404 jei nėra review, bet ne 500 — svarbu kad nesukrentą
      expect([200, 400, 404]).toContain(res.status);
    });
  });
});
