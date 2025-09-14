export default {
  async fetch(request) {
    const url = new URL(request.url);
    let targetUrl;
  
      // --- Side projects config ---
      const APPS = [
        { prefix: '/trustvibe',  origin: 'https://trustvibe.vercel.app' },
        { prefix: '/babyfeed',   origin: 'https://baby-feeding-timer.vercel.app' },
        { prefix: '/puzzlegame', origin: 'https://fullstack-maze-puzzle.vercel.app' },
      ];
      const PORTFOLIO = 'https://danielwong.vercel.app';
  
      // ---------- Helpers ----------
      const getAppFromPath = (pathname) =>
        APPS.find(a => pathname === a.prefix || pathname.startsWith(a.prefix + '/')) || null;
  
      const getAppFromReferer = (req) => {
        const ref = req.headers.get('Referer') || '';
        try {
          const u = new URL(ref);
          return getAppFromPath(u.pathname || '/');
        } catch {}
        return null;
      };
  
      // Cookie fallback：當部份請求（例如預載）冇 Referer 時，用親和力 Cookie 判斷屬於邊個子 App
      const getAppFromCookie = (req) => {
        const cookie = req.headers.get('Cookie') || '';
        const m = cookie.match(/(?:^|;\s*)fs_app=([^;]+)/);
        if (!m) return null;
        const val = decodeURIComponent(m[1] || '');
        return APPS.find(a => a.prefix === val) || null;
      };
  
    // Host 正規化：全部轉去 www，避免跨子網域 Cookie/Origin 差異
    if (url.hostname === 'faithfulstack.com') {
      return Response.redirect(`https://www.faithfulstack.com${url.pathname}${url.search}`, 301);
    }

    // 根路徑糾正：如果曾經進入過某個子 App，而家誤導向到 "/"，帶返去該子 App
    {
      const appFromCookie = getAppFromCookie(request);
      const appFromRef = getAppFromReferer(request);
      if (url.pathname === '/' && (appFromCookie || appFromRef)) {
        const app = appFromCookie || appFromRef;
        return Response.redirect(`${url.origin}${app.prefix}`, 302);
      }
    }

    // Auth 頁糾正：如 path 為 /sign-in 或 /sign-up，依 Cookie/Referer 決定子 App
    if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
      const app = getAppFromCookie(request) || getAppFromReferer(request) || APPS.find(a => a.prefix === '/babyfeed');
      const leaf = url.pathname.slice(1); // 'sign-in' | 'sign-up'
      return Response.redirect(`${url.origin}${app.prefix}/${leaf}${url.search}`, 302);
    }
    
    // PWA manifest：當前處於某個子 App 時，把 /manifest.json 重定向到該子 App 的 /<prefix>/manifest.json
    if (url.pathname === '/manifest.json') {
      const app = getAppFromCookie(request) || getAppFromReferer(request);
      if (app) {
        return Response.redirect(`${url.origin}${app.prefix}/manifest.json${url.search}`, 302);
      }
    }
  
      // 1) Next.js build assets
      if (url.pathname.startsWith('/_next/')) {
        const app = getAppFromCookie(request) || getAppFromReferer(request); // 或加 cookie fallback
        const origin = app?.origin || PORTFOLIO;
        const key = `${url.pathname}${url.search}::${app?.prefix || 'portfolio'}`;
        const targetUrl = origin + url.pathname + url.search;
        return proxyFetch(request, targetUrl, {
          cacheSeconds: 3600,
          appPrefix: app?.prefix || '',
          cacheKey: key,                // ★ 新增
        });
      }
  
  // 2) Static files
  if (/\.(png|jpg|jpeg|svg|ico|gif|webp|avif|css|js|json|txt|xml|woff2?|ttf|map)$/.test(url.pathname)) {
    const app = getAppFromCookie(request) || getAppFromReferer(request);
    const origin = app?.origin || PORTFOLIO;
    const key = `${url.pathname}${url.search}::${app?.prefix || 'portfolio'}`;
    // 重要：若屬於子 App，需先移除前綴再轉發到上游（上游以 root 提供靜態資源）
    let targetPath = url.pathname;
    if (app && (url.pathname === app.prefix || url.pathname.startsWith(app.prefix + '/'))) {
      targetPath = url.pathname.slice(app.prefix.length) || '/';
    }
    const targetUrl = origin + targetPath + url.search;
    return proxyFetch(request, targetUrl, {
      cacheSeconds: 3600,
      appPrefix: app?.prefix || '',
      cacheKey: key,
    });
  }
  
      // 3) Puzzle Game API (DO FastAPI backend, keep your special rule)
      if (url.pathname.startsWith('/puzzlegame/api/')) {
        const backendServer = 'http://direct.faithfulstack.com:8000';
        const stripped = url.pathname.replace(/^\/puzzlegame\/api/, '');
        const normalized = stripped.startsWith('/auth') || stripped.startsWith('/api') ? stripped : '/api' + stripped;
        targetUrl = backendServer + normalized + url.search;
        return proxyFetch(request, targetUrl, {
          appPrefix: '/puzzlegame',
          rewriteRedirectLocation: (location) => rewriteBackendLocationToPublic(location),
        });
      }
  
    // 4) NEW: Same-origin API routing by Referer (fix CORS)
    //    當前端調用 /api/*（同源），按 Cookie/Referer 判斷屬於邊個子 App。
    //    另外：當 Cookie/Referer 都冇時（例如 OAuth 回呼），對以下路徑採用 babyfeed 作為合理預設：
    //    - /api/auth/*
    //    - /api/sessions/*
      if (url.pathname.startsWith('/api/')) {
        const getDefaultAppForApi = (pathname) => {
          if (pathname.startsWith('/api/auth/') || pathname === '/api/auth') return APPS.find(a => a.prefix === '/babyfeed');
          if (pathname.startsWith('/api/sessions')) return APPS.find(a => a.prefix === '/babyfeed');
          return null;
        };

        const app = getAppFromCookie(request) || getAppFromReferer(request) || getDefaultAppForApi(url.pathname);
        if (app) {
          targetUrl = app.origin + url.pathname + url.search; // 子 App 以 root 跑，唔需要再加 prefix
          return proxyFetch(request, targetUrl, { appPrefix: app.prefix });
        }
        // 無 Referer/Cookie 時（例如直打 /api），回 portfolio 或自定 fallback
        targetUrl = PORTFOLIO + url.pathname + url.search;
        return proxyFetch(request, targetUrl, { appPrefix: '' });
      }
  
      // 5) Side project routing (strip prefix then proxy)
      for (const app of APPS) {
        if (url.pathname === app.prefix || url.pathname.startsWith(app.prefix + '/')) {
          const strippedPath = url.pathname.slice(app.prefix.length) || '/';
          targetUrl = app.origin + strippedPath + url.search;
          return proxyFetch(request, targetUrl, { appPrefix: app.prefix });
        }
      }
  
      // 6) Portfolio fallback
      targetUrl = PORTFOLIO + url.pathname + url.search;
      return proxyFetch(request, targetUrl, { appPrefix: '' });
    }
  };
  
  // ---------- Helpers ----------
  
  function rewriteBackendLocationToPublic(location) {
    try {
      const locUrl = new URL(location, 'http://direct.faithfulstack.com:8000');
      if (locUrl.origin === 'http://direct.faithfulstack.com:8000') {
        return '/puzzlegame/api' + locUrl.pathname + locUrl.search;
      }
      return location;
    } catch {
      return location;
    }
  }
  
  /**
   * 穩陣 3xx Location 重寫：
   *  - 相對/絕對 URL 皆可（以 targetUrl 作基準）
   *  - 只重寫上游 host 或 public host；第三方域名保持不動
   *  - path 智能補上 appPrefix（避免 double-prefix）
   *  - 同步修正 redirect/callbackUrl/returnTo/next 等參數
   *  - 統一 host 到 public host
   */
  function rewriteLocationForApp({ location, sourceUrl, targetUrl, appPrefix }) {
    const upstreamUrl = new URL(targetUrl);
    try {
      const locUrl = new URL(location, upstreamUrl);
  
      const isUpstream = locUrl.host === upstreamUrl.host;
      const isPublic  = locUrl.host === sourceUrl.host;
      if (!isUpstream && !isPublic) return location; // 第三方域名，唔郁
  
      // 補 prefix（避免 double）
      let newPath = locUrl.pathname; // 以 / 開頭
      if (appPrefix && newPath !== appPrefix && !newPath.startsWith(appPrefix + '/')) {
        newPath = appPrefix + newPath;
      }
  
      // 修正常見跳轉參數
      for (const k of ['redirect', 'callbackUrl', 'returnTo', 'next']) {
        const v = locUrl.searchParams.get(k);
        if (v && v.startsWith('/') && appPrefix && !v.startsWith(appPrefix + '/')) {
          locUrl.searchParams.set(k, appPrefix + v);
        }
      }
  
      // 改回 public host
      locUrl.protocol = sourceUrl.protocol;
      locUrl.host = sourceUrl.host;
      locUrl.pathname = newPath;
  
      return locUrl.toString();
    } catch {
      if (location.startsWith('/') && appPrefix && !location.startsWith(appPrefix + '/')) {
        return appPrefix + location;
      }
      return location;
    }
  }
  
  async function proxyFetch(request, targetUrl, options = {}) {
    const sourceUrl = new URL(request.url);
  
    const headers = new Headers(request.headers);
    for (const h of ['connection','keep-alive','proxy-authenticate','proxy-authorization','te','trailer','transfer-encoding','upgrade','host']) {
      headers.delete(h);
    }
    headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || '');
    headers.set('X-Forwarded-Host', sourceUrl.host);
    headers.set('X-Forwarded-Proto', 'https');
  
    const cf = {};
    if (options.cacheSeconds) {
      cf.cacheEverything = true;
      cf.cacheTtl = options.cacheSeconds;
      if (options.cacheKey) {
        cf.cacheKey = options.cacheKey;   // ✅ Worker runtime 支援
      }
    }
  
    const init = {
      method: request.method,
      headers,
      redirect: 'manual',
      body: (request.method === 'GET' || request.method === 'HEAD') ? undefined : request.body,
      cf, // ✅ 簡單 object
    };
    // @ts-ignore
    const upstream = await fetch(targetUrl, init);
  
    // --- Fix redirects ---
    if (upstream.status >= 300 && upstream.status < 400) {
      let location = upstream.headers.get('Location');
      if (location) {
        const rewritten = rewriteLocationForApp({
          location,
          sourceUrl,
          targetUrl,
          appPrefix: options.appPrefix || '',
        });
  
        if (typeof options.rewriteRedirectLocation === 'function') {
          location = options.rewriteRedirectLocation(rewritten) || rewritten;
        } else {
          location = rewritten;
        }
  
        const newHeaders = new Headers(upstream.headers);
        newHeaders.set('Location', location);
        newHeaders.set('Cache-Control', 'no-store'); // 避免 3xx 被 cache 形成 loop
        // 在 3xx 亦同步寫入 fs_app，避免跨子網域/回呼場景丟失親和力
        if (typeof options.appPrefix !== 'undefined') {
          const v = encodeURIComponent(options.appPrefix || '');
          const domainAttr = getCookieDomainAttr(sourceUrl.host);
          const cookie = v
            ? `fs_app=${v}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=300${domainAttr}`
            : `fs_app=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0${domainAttr}`;
          newHeaders.append('Set-Cookie', cookie);
        }
        return new Response(null, { status: upstream.status, headers: newHeaders });
      }
    }
  
    // SSE passthrough
    const contentType = upstream.headers.get('Content-Type') || '';
    if (contentType.includes('text/event-stream')) {
      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: upstream.headers,
      });
    }
  
    // ★ HTML 導航：設置/清理親和力 Cookie（fs_app），讓之後冇 Referer 亦能判斷屬於邊個子 App
    const accept = request.headers.get('Accept') || '';
    const isHtmlNav = accept.includes('text/html') || contentType.includes('text/html');
    if (isHtmlNav && typeof options.appPrefix !== 'undefined') {
      const newHeaders = new Headers(upstream.headers);
      const v = encodeURIComponent(options.appPrefix || '');
      const domainAttr = getCookieDomainAttr(sourceUrl.host);
      const cookie = v
        ? `fs_app=${v}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=300${domainAttr}`
        : `fs_app=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0${domainAttr}`;
      newHeaders.append('Set-Cookie', cookie);
  
      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: newHeaders,
      });
    }
  
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: upstream.headers,
    });
  }

  // 擴充：根據 public host 計算 Cookie Domain，令 fs_app 可以跨 www 與 apex domain
  function getCookieDomainAttr(host) {
    try {
      // 只為 faithfulstack.com 統一跨子網域；其他網域保留默認（不加 Domain）
      const h = String(host || '').toLowerCase();
      if (h.endsWith('faithfulstack.com')) {
        // 轉成頂層 domain：.faithfulstack.com
        return `; Domain=.faithfulstack.com`;
      }
      return '';
    } catch {
      return '';
    }
  }
  
