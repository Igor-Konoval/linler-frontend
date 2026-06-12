'use client';

import { type JSX, type PropsWithChildren } from 'react';
import { ThemeProvider } from './theme-provider';
import { TQueryProvider } from './t-query-provider';
import { ToastProvider } from '../ui/toast';

export function Providers({ children }: PropsWithChildren): JSX.Element {
  return (
    <ThemeProvider>
      <TQueryProvider>
        <ToastProvider>{children}</ToastProvider>
      </TQueryProvider>
    </ThemeProvider>
  );
}
