'use client';

import {
  ThemeProvider as RootThemeProvider,
  type ThemeProviderProps,
} from 'next-themes';
import { type JSX } from 'react';

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps): JSX.Element {
  return (
    <RootThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </RootThemeProvider>
  );
}
