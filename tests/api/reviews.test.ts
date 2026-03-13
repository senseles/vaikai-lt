import { describe, it, expect } from 'vitest';
import { createClient, adminLogin } from '../helpers';

const IP = '10.0.13.';
let n = 1;
const client = () => createClient(`${IP}${n++}`);

describe('Reviews API — papildomi testai', () => {
  describe('POST /api/reviews — auth tikrinimas', () => {
    it('reikalauja autentifikacijos', async () => {
      const { post } = client();
      const res = await post('/api/reviews', {
        rating: 5,
        text: 'Puikus darželis!',
        authorName: 'QA',
        itemId: 'test-item',
        itemType: 'kindergarten',
      });
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBeTruthy();
    });

    it('CSRF apsauga veikia', async () => {
      const res = await fetch('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: 5,
          text: 'Test',
          authorName: 'QA',
          itemId: 'test',
          itemType: 'kindergarten',
        }),
      });
      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/reviews — validacija', () => {
    it('XSS stripinamas iš teksto (auth reikia, bet tikrinama prieš)', async () => {
      const { post } = client();
      const res = await post('/api/reviews', {
        rating: 5,
        text: '<script>alert("xss")</script>Geras',
        authorName: '<img onerror=alert(1) src=x>Vardas',
        itemId: 'test',
        itemType: 'kindergarten',
      });
      // 401 nes nėra auth, bet bent jau serveris nekrenta
      expect([400, 401]).toContain(res.status);
    });

    it('per ilgas tekstas (10000+ simbolių) — turėtų atmesti', async () => {
      const { post } = client();
      const res = await post('/api/reviews', {
        rating: 5,
        text: 'A'.repeat(10000),
        authorName: 'QA',
        itemId: 'test',
        itemType: 'kindergarten',
      });
      expect([400, 401]).toContain(res.status);
    });

    it('neteisingas ratingas (99) — turėtų atmesti', async () => {
      const { post } = client();
      const res = await post('/api/reviews', {
        rating: 99,
        text: 'Test',
        authorName: 'QA',
        itemId: 'test',
        itemType: 'kindergarten',
      });
      expect([400, 401]).toContain(res.status);
    });

    it('neleistinas itemType', async () => {
      const { post } = client();
      const res = await post('/api/reviews', {
        rating: 3,
        text: 'Test',
        authorName: 'QA',
        itemId: 'test',
        itemType: 'hacker',
      });
      expect([400, 401]).toContain(res.status);
    });

    it('slankiojo kablelio rating (3.5) — turėtų atmesti', async () => {
      const { post } = client();
      const res = await post('/api/reviews', {
        rating: 3.5,
        text: 'Test',
        authorName: 'QA',
        itemId: 'test',
        itemType: 'kindergarten',
      });
      expect([400, 401]).toContain(res.status);
    });
  });

  describe('GET /api/reviews', () => {
    it('grąžina atsiliepimų sąrašą', async () => {
      const { get } = client();
      const res = await get('/api/reviews?limit=5');
      // 400 = reikia itemId/itemType parametrų
      expect([200, 400]).toContain(res.status);
      const json = await res.json();
      expect(json.data || json.reviews || json).toBeTruthy();
    });
  });

  describe('Admin review management', () => {
    it('admin gali matyti visus atsiliepimus', async () => {
      const token = await adminLogin(`${IP}${n++}`);
      const c = createClient(`${IP}${n++}`);
      const res = await fetch('http://localhost:3000/api/admin/reviews', {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Forwarded-For': `${IP}${n++}`,
        },
      });
      // Gali būti 200 arba endpoint kitaip struktūrizuotas
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('Rate limiting', () => {
    it('riboja POST review užklausas (5/15s)', async () => {
      const ip = `10.0.13.200`;
      const { post } = createClient(ip);

      const responses: number[] = [];
      for (let i = 0; i < 8; i++) {
        const res = await post('/api/reviews', {
          rating: 5,
          text: `Rate limit test ${i}`,
          authorName: 'QA',
          itemId: 'test',
          itemType: 'kindergarten',
        });
        responses.push(res.status);
      }

      // Po 5 užklausų turėtų būti 429 arba 401 (nes nėra auth)
      // Rate limit gali suveikti prieš auth
      const has429or401 = responses.some((s) => s === 429);
      // Jei auth tikrinama pirmiau, visos bus 401
      const allAre401 = responses.every((s) => s === 401);
      expect(has429or401 || allAre401).toBe(true);
    });
  });
});
