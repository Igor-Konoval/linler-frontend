import { decodeJwt } from 'jose';
import { type NextRequest, NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '@/src/constants/base.constants';
import { serverEnv } from '@/src/env/server';
import { PATHNAME_HEADER, ROUTES } from '@/src/constants/routes.constants';

import {
  applySecurityHeaders,
  createNextResponse,
  isAuthPath,
  isProtectedPath,
  removeAuthCookies,
} from '../utils/proxy.utils';

type HeadersWithGetSetCookie = Headers & {
  getSetCookie?: () => string[];
};

function createRedirectResponse(request: NextRequest, url: URL): NextResponse {
  const response = NextResponse.redirect(url);

  response.headers.set(PATHNAME_HEADER, request.nextUrl.pathname);

  return applySecurityHeaders(response);
}

function isAccessTokenExpiredOrInvalid(accessToken?: string): boolean {
  if (!accessToken) {
    return true;
  }

  try {
    const payload = decodeJwt(accessToken);

    if (typeof payload.exp !== 'number') {
      return true;
    }

    const expiresAt = payload.exp * 1000;
    const refreshBeforeMs = 10_000;

    return expiresAt <= Date.now() + refreshBeforeMs;
  } catch {
    return true;
  }
}

function copySetCookies(
  sourceResponse: Response,
  targetResponse: NextResponse,
): void {
  const headers = sourceResponse.headers as HeadersWithGetSetCookie;

  const cookieValues = headers.getSetCookie?.() ?? [];

  for (const cookieValue of cookieValues) {
    targetResponse.headers.append('set-cookie', cookieValue);
  }

  if (cookieValues.length > 0) {
    return;
  }

  const fallbackCookie = sourceResponse.headers.get('set-cookie');

  if (fallbackCookie) {
    targetResponse.headers.append('set-cookie', fallbackCookie);
  }
}

async function refreshSession(
  request: NextRequest,
): Promise<Response | undefined> {
  try {
    return await fetch(`${serverEnv.API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        cookie: request.headers.get('cookie') ?? '',
      },
      cache: 'no-store',
    });
  } catch {
    return undefined;
  }
}

async function refreshAndRedirect(
  request: NextRequest,
  redirectUrl: URL,
): Promise<NextResponse | undefined> {
  const refreshResponse = await refreshSession(request);

  if (!refreshResponse?.ok) {
    return undefined;
  }

  const response = createRedirectResponse(request, redirectUrl);

  copySetCookies(refreshResponse, response);

  return response;
}

export async function authProxy(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

  const protectedPage = isProtectedPath(pathname);
  const authPage = isAuthPath(pathname);

  const accessTokenInvalid = isAccessTokenExpiredOrInvalid(accessToken);

  const hasLiveAccessToken = Boolean(accessToken) && !accessTokenInvalid;

  const canRefreshSession = Boolean(refreshToken) && accessTokenInvalid;

  if (canRefreshSession) {
    const redirectUrl = authPage
      ? new URL(ROUTES.HOME, request.url)
      : new URL(request.url);

    const refreshedResponse = await refreshAndRedirect(request, redirectUrl);

    if (refreshedResponse) {
      return refreshedResponse;
    }

    const response = protectedPage
      ? createRedirectResponse(request, new URL(ROUTES.LOGIN, request.url))
      : createNextResponse(request);

    removeAuthCookies(response);

    return response;
  }

  if (protectedPage && !hasLiveAccessToken) {
    const response = createRedirectResponse(
      request,
      new URL(ROUTES.LOGIN, request.url),
    );

    removeAuthCookies(response);

    return response;
  }

  if (authPage && hasLiveAccessToken) {
    return createRedirectResponse(request, new URL(ROUTES.HOME, request.url));
  }

  return createNextResponse(request);
}
