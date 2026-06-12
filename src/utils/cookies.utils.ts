import { getCookie } from 'cookies-next';

export function getClientCookie(name: string): string | undefined {
  const value = getCookie(name);

  return typeof value === 'string' ? value : undefined;
}
