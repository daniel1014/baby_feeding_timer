import { NextRequest, NextResponse } from "next/server";

// basePath must match next.config.ts
const BASE_PATH = "/babyfeed";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip basePath from pathname for route matching
  // e.g., "/babyfeed/sign-in" → "/sign-in", "/babyfeed" → "/"
  const normalizedPathname = pathname.startsWith(BASE_PATH)
    ? pathname.slice(BASE_PATH.length) || "/"
    : pathname;

  // Skip middleware for static files and API routes (check both original and normalized)
  if (
    pathname.startsWith("/_next") ||
    normalizedPathname.startsWith("/api") ||
    pathname.startsWith(`${BASE_PATH}/_next`) ||
    pathname.startsWith(`${BASE_PATH}/api`) ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Allow access to public pages (guest mode)
  if (
    normalizedPathname === "/" ||
    normalizedPathname.startsWith("/sign-in") ||
    normalizedPathname.startsWith("/sign-up") ||
    normalizedPathname.startsWith("/forgot-password") ||
    normalizedPathname.startsWith("/reset-password") ||
    normalizedPathname.startsWith("/simple") ||
    normalizedPathname.startsWith("/test")
  ) {
    return NextResponse.next();
  }

  // For now, just check for session cookie (Edge runtime friendly)
  // Better Auth 會在 production 使用 __Secure- 前綴
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  if (!sessionCookie?.value) {
    // Include basePath in redirect URL
    const signInUrl = new URL(`${BASE_PATH}/sign-in`, request.url);
    signInUrl.searchParams.set("redirect", normalizedPathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (static assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
