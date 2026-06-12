import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '@/src/constants/base.constants';
import { serverEnv } from '@/src/env/server';
import { AuthAdapter } from '@/src/types/adapter.types';
import { cookies } from 'next/headers';

export class ServerAuthAdapter implements AuthAdapter {
  async getAccessToken(): Promise<string | undefined> {
    const cookieStore = await cookies();

    return cookieStore.get(ACCESS_TOKEN_KEY)?.value;
  }

  async getRefreshToken(): Promise<string | undefined> {
    const cookieStore = await cookies();

    return cookieStore.get(REFRESH_TOKEN_KEY)?.value;
  }

  async getCookieHeader(): Promise<string | undefined> {
    const cookieStore = await cookies();

    return cookieStore.toString();
  }

  async refreshToken(refreshToken: string): Promise<boolean> {
    const response = await fetch(`${serverEnv.API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    return response.ok;
  }
}
