// Utilities to determine the app's base path when mounted behind a reverse proxy
// that serves the app under a subpath (e.g. /babyfeed). The Cloudflare Worker
// sets an HttpOnly cookie `fs_app` with the app prefix which we can use.

// Client-side: read from document.cookie or infer from current pathname.
export function getBasePathClient(): string {
  try {
    if (typeof document !== 'undefined') {
      const m = document.cookie.match(/(?:^|;\s*)fs_app=([^;]+)/);
      if (m && m[1]) {
        const v = decodeURIComponent(m[1]);
        if (typeof v === 'string' && v.startsWith('/')) return v.replace(/\/$/, '');
      }
    }
  } catch {}

  try {
    if (typeof window !== 'undefined') {
      const candidates = ['/babyfeed', '/trustvibe', '/puzzlegame'];
      const p = window.location.pathname || '';
      const hit = candidates.find((c) => p === c || p.startsWith(c + '/'));
      if (hit) return hit;
    }
  } catch {}

  const env = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
  return env;
}

// Server-side: read from cookies() provided by Next.js headers.
export function getBasePathServer(): string {
  try {
    // next/headers is only available in server components/routes
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { cookies } = require('next/headers');
    const c = cookies();
    const v = c.get('fs_app')?.value || '';
    if (v && typeof v === 'string') return decodeURIComponent(v).replace(/\/$/, '');
  } catch {}

  const env = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
  return env;
}

export function prefixPath(path: string, basePath?: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = (basePath || '').replace(/\/$/, '');
  if (!base) return normalizedPath;
  if (normalizedPath === base || normalizedPath.startsWith(base + '/')) return normalizedPath;
  return base + normalizedPath;
}

