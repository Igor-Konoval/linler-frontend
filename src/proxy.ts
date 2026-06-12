import { type NextRequest } from 'next/server';
import { authProxy } from './proxy/auth.proxy';

export default function proxy(request: NextRequest) {
  return authProxy(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|fonts|images).*)',
  ],
};
