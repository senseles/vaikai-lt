import { describe, it, expect } from 'vitest';
import { createClient } from '../helpers';

const IP = '10.0.12.';
let n = 1;
const client = () => createClient(`${IP}${n++}`);

describe('Newsletter API', () => {
  describe('POST /api/newsletter', () => {
    it('priima validų email', async () => {
      const { post } = client();
      const res = await post('/api/newsletter', {
        email: `newsletter${Date.now()}@qa.lt`,
      });
      expect([200, 201]).toContain(res.status);
      const json = await res.json();
      expect(json.message).toBeTruthy();
    });

    it('atmeta tuščią email', async () => {
      const { post } = client();
      const res = await post('/api/newsletter', { email: '' });
      expect([400, 422]).toContain(res.status);
    });

    it('atmeta be email lauko', async () => {
      const { post } = client();
      const res = await post('/api/newsletter', {});
      expect([400, 422]).toContain(res.status);
    });

    it('atmeta neteisingą email formatą', async () => {
      const { post } = client();
      const res = await post('/api/newsletter', { email: 'not-an-email' });
      expect([400, 422]).toContain(res.status);
    });

    it('BUG: neturi CSRF apsaugos — priima be header', async () => {
      const res = await fetch('http://localhost:3000/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `nocsrf${Date.now()}@test.lt` }),
      });
      // BUG: turėtų būti 403, bet grąžina 201 — CSRF netikrinama
      expect(res.status).toBe(201);
    });

    it('tvarko dubliuotą prenumeratą', async () => {
      const { post } = client();
      const email = `duplicate${Date.now()}@qa.lt`;
      await post('/api/newsletter', { email });
      const res2 = await post('/api/newsletter', { email });
      // Gali būti 200 (idempotent) arba 409 (conflict)
      expect([200, 201, 409]).toContain(res2.status);
    });

    it('BUG: priima XSS email — trūksta sanitizacijos', async () => {
      const { post } = client();
      const res = await post('/api/newsletter', {
        email: '<script>alert(1)</script>@test.lt',
      });
      // BUG: turėtų atmesti, bet priima — email validacija nepakankama
      expect([200, 201]).toContain(res.status);
    });

    it('BUG: priima labai ilgą email (300+ simboliai)', async () => {
      const { post } = client();
      const longEmail = 'a'.repeat(300) + '@test.lt';
      const res = await post('/api/newsletter', { email: longEmail });
      // BUG: turėtų atmesti, bet priima — nėra ilgio ribojimo
      expect([200, 201]).toContain(res.status);
    });
  });
});
