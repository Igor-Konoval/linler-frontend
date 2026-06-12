import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '../constants/base.constants';
import { clientEnv } from '../env/client';
import { getClientCookie } from './cookies.utils';
import { getServerCookie } from './server-cookies.utils';

export class TokenManager {
  static async getAccessToken() {
    if (typeof window === 'undefined') {
      return getServerCookie(ACCESS_TOKEN_KEY);
    }
    return getClientCookie(ACCESS_TOKEN_KEY);
  }

  static async getRefreshToken() {
    if (typeof window === 'undefined') {
      return getServerCookie(REFRESH_TOKEN_KEY);
    }
    return getClientCookie(REFRESH_TOKEN_KEY);
  }

  static async refresh(refreshToken: string): Promise<boolean> {
    const res = await fetch(`${clientEnv.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    return res.ok;
  }
}
