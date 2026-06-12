import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '@/src/constants/base.constants';
import { clientEnv } from '@/src/env/client';
import { AuthAdapter } from '@/src/types/adapter.types';
import { getCookie } from 'cookies-next';

export class ClientAuthAdapter implements AuthAdapter {
  async getAccessToken(): Promise<string | undefined> {
    const token = getCookie(ACCESS_TOKEN_KEY);

    return typeof token === 'string' ? token : undefined;
  }

  async getRefreshToken(): Promise<string | undefined> {
    const token = getCookie(REFRESH_TOKEN_KEY);

    return typeof token === 'string' ? token : undefined;
  }

  async getCookieHeader(): Promise<string | undefined> {
    return document.cookie;
  }

  async refreshToken(refreshToken: string): Promise<boolean> {
    const response = await fetch(
      `${clientEnv.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
        credentials: 'include',
      },
    );

    return response.ok;
  }
}
