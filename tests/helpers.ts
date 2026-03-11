/** Shared test helpers */
export const BASE = 'http://localhost:3000';

/** Headers that bypass CSRF check for POST requests */
export const CSRF_HEADERS = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
};

/**
 * Create a helper set scoped to a unique fake IP.
 * This avoids rate limit collisions between test files.
 */
export function createClient(fakeIp: string) {
  const ipHeader = { 'X-Forwarded-For': fakeIp };

  async function get(path: string) {
    return fetch(`${BASE}${path}`, { headers: ipHeader });
  }

  async function post(path: string, body: unknown) {
    return fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { ...CSRF_HEADERS, ...ipHeader },
      body: JSON.stringify(body),
    });
  }

  async function patchReq(path: string, body: unknown, extraHeaders: Record<string, string> = {}) {
    return fetch(`${BASE}${path}`, {
      method: 'PATCH',
      headers: { ...CSRF_HEADERS, ...ipHeader, ...extraHeaders },
      body: JSON.stringify(body),
    });
  }

  async function del(path: string, extraHeaders: Record<string, string> = {}) {
    return fetch(`${BASE}${path}`, {
      method: 'DELETE',
      headers: { ...CSRF_HEADERS, ...ipHeader, ...extraHeaders },
    });
  }

  return { get, post, patch: patchReq, del };
}

/** Login as admin, return token */
export async function adminLogin(fakeIp: string): Promise<string> {
  const { post } = createClient(fakeIp);
  const res = await post('/api/admin/login', { password: 'darzeliai2026' });
  const json = await res.json();
  const setCookie = res.headers.get('set-cookie') || '';
  const match = setCookie.match(/admin_token=([^;]+)/);
  return match ? match[1] : json.data?.token || '';
}
