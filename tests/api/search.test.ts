import { describe, it, expect } from 'vitest';
import { createClient } from '../helpers';

const IP = '10.0.11.';
let n = 1;
const client = () => createClient(`${IP}${n++}`);

describe('Search API', () => {
  describe('GET /api/search', () => {
    it('grąžina rezultatus su q parametru', async () => {
      const { get } = client();
      const res = await get('/api/search?q=Vilnius');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('suggestions');
      expect(Array.isArray(json.suggestions)).toBe(true);
    });

    it('grąžina tuščią masyvą su neegzistuojančiu terminu', async () => {
      const { get } = client();
      const res = await get('/api/search?q=xyznonexistent123');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.suggestions).toHaveLength(0);
    });

    it('veikia su tuščiu q parametru', async () => {
      const { get } = client();
      const res = await get('/api/search?q=');
      expect([200, 400]).toContain(res.status);
    });

    it('veikia be q parametro', async () => {
      const { get } = client();
      const res = await get('/api/search');
      expect([200, 400]).toContain(res.status);
    });

    it('neatskleidžia XSS payload', async () => {
      const { get } = client();
      const res = await get('/api/search?q=%3Cscript%3Ealert(1)%3C/script%3E');
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).not.toContain('<script>');
    });

    it('neatskleidžia SQL injection', async () => {
      const { get } = client();
      const res = await get("/api/search?q=test'%20OR%201=1--");
      expect(res.status).toBe(200);
      // Neturėtų grąžinti klaidų ar visų rezultatų
      const json = await res.json();
      expect(json).toHaveProperty('suggestions');
    });

    it('veikia su lietuviškomis raidėmis (URL encoded)', async () => {
      const { get } = client();
      const res = await get('/api/search?q=%C5%A1eima');
      expect(res.status).toBe(200);
    });

    it('grąžina max 8 pasiūlymų', async () => {
      const { get } = client();
      const res = await get('/api/search?q=dar');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.suggestions.length).toBeLessThanOrEqual(8);
    });
  });

  describe('GET /api/search/suggestions', () => {
    it('grąžina pasiūlymus', async () => {
      const { get } = client();
      const res = await get('/api/search/suggestions?q=Vilnius');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(Array.isArray(json.suggestions || json)).toBe(true);
    });
  });
});
