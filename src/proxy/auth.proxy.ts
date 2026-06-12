import { jwtVerify } from 'jose';
import { type NextRequest, NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_KEY,
  REFRESH_GUARD_COOKIE_KEY,
  REFRESH_GUARD_MAX_AGE_SECONDS,
  REFRESH_RATE_LIMIT_COOLDOWN_MS,
  REFRESH_RATE_LIMITED_UNTIL_COOKIE_KEY,
  REFRESH_TOKEN_KEY,
} from '@/src/constants/base.constants';

import { StatusCodes } from '@/src/constants/http.constants';

import { PATHNAME_HEADER, ROUTES } from '@/src/constants/routes.constants';
import { RefreshResult, TokenPair } from '../types/base.types';
import {
  applySecurityHeaders,
  createNextResponse,
  getCookieOptions,
  getLoginUrl,
  isAuthPath,
  isProtectedPath,
  removeAuthCookies,
} from '../utils/proxy.utils';
import { errorLogging } from '../utils/request-failure.utils';
import { serverEnv } from '../env/server';

function createRedirectResponse(request: NextRequest, url: URL): NextResponse {
  const response = NextResponse.redirect(url);

  response.headers.set(PATHNAME_HEADER, request.nextUrl.pathname);

  return applySecurityHeaders(response);
}

function saveAuthCookies(response: NextResponse, tokens: TokenPair): void {
  response.cookies.set(
    ACCESS_TOKEN_KEY,
    tokens.accessToken,
    getCookieOptions(tokens.accessExpiresAt),
  );

  response.cookies.set(
    REFRESH_TOKEN_KEY,
    tokens.refreshToken,
    getCookieOptions(tokens.refreshExpiresAt),
  );

  response.cookies.set(REFRESH_GUARD_COOKIE_KEY, '1', {
    path: '/',
    maxAge: REFRESH_GUARD_MAX_AGE_SECONDS,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  response.cookies.delete(REFRESH_RATE_LIMITED_UNTIL_COOKIE_KEY);
}

function setRefreshCooldown(response: NextResponse): void {
  const limitedUntil = Date.now() + REFRESH_RATE_LIMIT_COOLDOWN_MS;

  response.cookies.set(
    REFRESH_RATE_LIMITED_UNTIL_COOKIE_KEY,
    String(limitedUntil),
    {
      path: '/',
      maxAge: Math.ceil(REFRESH_RATE_LIMIT_COOLDOWN_MS / 1000),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  );
}

function isRefreshCooldownActive(request: NextRequest): boolean {
  const limitedUntil = request.cookies.get(
    REFRESH_RATE_LIMITED_UNTIL_COOKIE_KEY,
  )?.value;

  return Boolean(limitedUntil && Number(limitedUntil) > Date.now());
}

function shouldSetRefreshCooldown(statusCode: number): boolean {
  return (
    statusCode === StatusCodes.TooManyRequests ||
    statusCode === StatusCodes.UnprocessableEntity ||
    statusCode === StatusCodes.InternalServerError ||
    statusCode === StatusCodes.ServiceUnavailable
  );
}

async function isValidAccessToken(accessToken: string): Promise<boolean> {
  const secret = serverEnv.JWT_ACCESS_SECRET;

  if (!secret) {
    return false;
  }

  try {
    const encodedSecret = new TextEncoder().encode(secret);

    await jwtVerify(accessToken, encodedSecret);

    return true;
  } catch {
    return false;
  }
}

function isTokenPair(value: unknown): value is TokenPair {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<TokenPair>;

  return (
    typeof candidate.accessToken === 'string' &&
    typeof candidate.refreshToken === 'string' &&
    typeof candidate.accessExpiresAt === 'string' &&
    typeof candidate.refreshExpiresAt === 'string'
  );
}

function extractTokenPair(payload: unknown): TokenPair | undefined {
  if (isTokenPair(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const candidate = payload as { data?: unknown };

  if (isTokenPair(candidate.data)) {
    return candidate.data;
  }

  return undefined;
}

async function refreshTokens(refreshToken: string): Promise<RefreshResult> {
  try {
    const response = await fetch(
      `${serverEnv.API_URL}/auth/refresh`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    );

    const payload = await response
      .json()
      .catch((error) =>
        errorLogging('Failed to parse refresh response payload', error),
      );

    return {
      tokens: response.ok ? extractTokenPair(payload) : undefined,
      statusCode: response.status,
    };
  } catch {
    return {
      statusCode: StatusCodes.InternalServerError,
    };
  }
}

async function handleInvalidAuthState(
  request: NextRequest,
  refreshToken?: string,
): Promise<NextResponse> {
  if (!refreshToken) {
    const response = createRedirectResponse(request, getLoginUrl(request));

    removeAuthCookies(response);

    return response;
  }

  if (isRefreshCooldownActive(request)) {
    const response = createRedirectResponse(request, getLoginUrl(request));

    removeAuthCookies(response);

    return response;
  }

  const refreshResult = await refreshTokens(refreshToken);

  if (!refreshResult.tokens) {
    const response = createRedirectResponse(request, getLoginUrl(request));

    removeAuthCookies(response);

    if (shouldSetRefreshCooldown(refreshResult.statusCode)) {
      setRefreshCooldown(response);
    }

    return response;
  }

  const response = createRedirectResponse(request, new URL(request.url));

  saveAuthCookies(response, refreshResult.tokens);

  return response;
}

export async function authProxy(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;
  const refreshGuard = request.cookies.get(REFRESH_GUARD_COOKIE_KEY)?.value;

  const protectedPage = isProtectedPath(pathname);
  const authPage = isAuthPath(pathname);

  const validAccessToken = accessToken
    ? await isValidAccessToken(accessToken)
    : false;

  if (validAccessToken && authPage) {
    return createRedirectResponse(request, new URL(ROUTES.HOME, request.url));
  }

  if (!protectedPage) {
    const response = createNextResponse(request);

    if (!validAccessToken && accessToken) {
      response.cookies.delete(ACCESS_TOKEN_KEY);
    }

    return response;
  }

  if (validAccessToken) {
    const response = createNextResponse(request);

    if (refreshGuard) {
      response.cookies.delete(REFRESH_GUARD_COOKIE_KEY);
    }

    return response;
  }

  if (refreshGuard) {
    const response = createRedirectResponse(request, getLoginUrl(request));

    removeAuthCookies(response);

    return response;
  }

  return handleInvalidAuthState(request, refreshToken);
}
