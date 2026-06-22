import type { Metadata } from 'next';
import { Providers } from '../components/providers/providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Linler',
    template: '%s - Linler',
  },
  description:
    'Linler is a modern task planner and progress tracker with a variety of convenient views.',
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
