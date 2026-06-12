import { type NextRequest, NextResponse } from 'next/server';
import {
  AUTH_PAGES_URLS_ARRAY,
  LOGIN_QUERY_PARAM,
  PATHNAME_HEADER,
  PROTECTED_PAGES_URLS_ARRAY,
  ROUTES,
} from '../constants/routes.constants';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_GUARD_COOKIE_KEY,
  REFRESH_RATE_LIMITED_UNTIL_COOKIE_KEY,
  REFRESH_TOKEN_KEY,
} from '../constants/base.constants';

export function applySecurityHeaders(response: NextResponse): NextResponse {
  const contentSecurityPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https: wss: blob: data:",
    "frame-src 'self' https:",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', contentSecurityPolicy);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  }

  return response;
}

export function createNextResponse(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set(PATHNAME_HEADER, request.nextUrl.pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set(PATHNAME_HEADER, request.nextUrl.pathname);

  return applySecurityHeaders(response);
}

export function isSameOrNestedPath(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PAGES_URLS_ARRAY.some((route) =>
    isSameOrNestedPath(pathname, route),
  );
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_PAGES_URLS_ARRAY.some((route) =>
    isSameOrNestedPath(pathname, route),
  );
}

export function getLoginUrl(request: NextRequest): URL {
  const url = new URL(ROUTES.HOME, request.url);

  url.searchParams.set(LOGIN_QUERY_PARAM, 'true');

  return url;
}

export function getCookieOptions(expires?: string | Date) {
  return {
    path: '/',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    ...(expires ? { expires: new Date(expires) } : {}),
  };
}

export function removeAuthCookies(response: NextResponse): void {
  response.cookies.delete(ACCESS_TOKEN_KEY);
  response.cookies.delete(REFRESH_TOKEN_KEY);
  response.cookies.delete(REFRESH_GUARD_COOKIE_KEY);
  response.cookies.delete(REFRESH_RATE_LIMITED_UNTIL_COOKIE_KEY);
}
