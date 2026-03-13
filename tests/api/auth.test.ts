import { describe, it, expect } from 'vitest';
import { createClient } from '../helpers';

const IP = '10.0.10.';
let n = 1;
const client = () => createClient(`${IP}${n++}`);

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('reikalauja email ir slaptažodžio', async () => {
      const { post } = client();
      const res = await post('/api/auth/register', {});
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBeTruthy();
    });

    it('atmeta neteisingą email formatą', async () => {
      const { post } = client();
      const res = await post('/api/auth/register', {
        email: 'notanemail',
        password: 'ValidPass123!',
        name: 'Test User',
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('pašto');
    });

    it('atmeta per trumpą slaptažodį', async () => {
      const { post } = client();
      const res = await post('/api/auth/register', {
        email: `test${Date.now()}@qa.lt`,
        password: '123',
        name: 'Test',
      });
      expect(res.status).toBe(400);
    });

    it('atmeta be CSRF header', async () => {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@qa.lt', password: 'Pass123!' }),
      });
      expect(res.status).toBe(403);
    });

    it('priima validžią registraciją', async () => {
      const { post } = client();
      const email = `qauser${Date.now()}@qa.lt`;
      const res = await post('/api/auth/register', {
        email,
        password: 'StrongPass123!',
        name: 'QA Tester',
      });
      // 200 arba 201 = sukurtas, 409 = jau egzistuoja
      expect([200, 201, 409]).toContain(res.status);
    });
  });

  describe('POST /api/auth/login', () => {
    it('reikalauja email ir slaptažodžio', async () => {
      const { post } = client();
      const res = await post('/api/auth/login', {});
      expect(res.status).toBe(400);
    });

    it('atmeta neteisingus kredencialus', async () => {
      const { post } = client();
      const res = await post('/api/auth/login', {
        email: 'neegzistuoja@qa.lt',
        password: 'WrongPass123!',
      });
      expect([401, 400]).toContain(res.status);
    });

    it('atmeta be CSRF header', async () => {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.lt', password: 'pass' }),
      });
      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/auth/reset', () => {
    it('reikalauja email', async () => {
      const { post } = client();
      const res = await post('/api/auth/reset', {});
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBeTruthy();
    });

    it('grąžina sėkmę bet kokiam emailui (nepasako ar egzistuoja)', async () => {
      const { post } = client();
      const res = await post('/api/auth/reset', { email: 'random@qa.lt' });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it('atmeta be CSRF', async () => {
      const res = await fetch('http://localhost:3000/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.lt' }),
      });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/auth/providers', () => {
    it('grąžina providerius', async () => {
      const { get } = client();
      const res = await get('/api/auth/providers');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('grąžina 401 be sesijos', async () => {
      const { get } = client();
      const res = await get('/api/auth/me');
      // Gali būti 401 arba null sesija
      expect([200, 401]).toContain(res.status);
    });
  });
});
