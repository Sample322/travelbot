import ky from 'ky';

/**
 * Compute headers for API requests. The Telegram user ID is passed
 * in a custom header for backend endpoints that require
 * identification. Note: the backend verifies the signature via
 * `initData` on login, so sending the user ID is safe for
 * subsequent requests.
 */
export function headers() {
  const tg = (window as any).Telegram?.WebApp;
  const uid = tg?.initDataUnsafe?.user?.id;
  return uid ? { 'x-user-id': String(uid) } : {};
}

// Base URL of the API. In production this will be the same origin,
// while in development you can override it with VITE_API_BASE.
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Create a preconfigured ky instance that appends the Telegram user ID
// header to each request. ky throws on non-2xx responses; handle
// errors at call sites as needed.
export const api = ky.create({
  prefixUrl: API_BASE,
  hooks: {
    beforeRequest: [request => {
      const hdrs = headers();
      Object.entries(hdrs).forEach(([key, value]) => request.headers.set(key, value));
    }]
  }
});

/**
 * Verify the user with the backend using the Telegram initData. This
 * call should be performed once on app load. If the initData is
 * invalid or missing the backend will reject the request.
 */
export async function authVerify() {
  const tg = (window as any).Telegram?.WebApp;
  const initData = tg?.initData || '';
  return api.post('auth/verify', { json: { initData } }).json();
}