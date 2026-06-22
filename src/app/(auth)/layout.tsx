import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: '%s - Linler',
  description:
    'Linler is a modern task planner and progress tracker with a variety of convenient views.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="flex-1">{children}</main>;
}
