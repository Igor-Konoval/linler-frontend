import { cookies } from 'next/headers';
import type { AuthAdapter } from '@/src/types/adapter.types';

export class ServerAuthAdapter implements AuthAdapter {
  readonly supportsRefresh = false;

  async getCookieHeader(): Promise<string | undefined> {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    return cookieHeader || undefined;
  }

  async refreshToken(): Promise<boolean> {
    return false;
  }
}
