import { cookies } from 'next/headers';

export async function getServerCookie(
  name: string,
): Promise<string | undefined> {
  const cookieStore = await cookies();

  return cookieStore.get(name)?.value;
}
