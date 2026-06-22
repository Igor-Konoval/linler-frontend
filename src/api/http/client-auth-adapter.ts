import { clientEnv } from '@/src/env/client';
import type { AuthAdapter } from '@/src/types/adapter.types';

export class ClientAuthAdapter implements AuthAdapter {
  readonly supportsRefresh = true;

  private static refreshPromise: Promise<boolean> | null = null;

  async getCookieHeader(): Promise<string | undefined> {
    return undefined;
  }

  async refreshToken(): Promise<boolean> {
    if (!ClientAuthAdapter.refreshPromise) {
      ClientAuthAdapter.refreshPromise = this.performRefresh().finally(() => {
        ClientAuthAdapter.refreshPromise = null;
      });
    }

    return ClientAuthAdapter.refreshPromise;
  }

  private async performRefresh(): Promise<boolean> {
    const response = await fetch(
      `${clientEnv.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        method: 'POST',
        credentials: 'include',
      },
    );

    return response.ok;
  }
}
