import type { Metadata, Viewport } from 'next';
import { Providers } from '../components/providers/providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Linler',
    template: '%s - Linler',
  },
  description:
    'Linler is a modern task planner and progress tracker with a variety of convenient views.',
  icons: {
    icon: [{ url: '/linler-icon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="bg-background flex min-h-full w-full flex-1 flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
