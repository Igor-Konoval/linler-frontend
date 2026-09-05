'use client';

import { type JSX, type PropsWithChildren } from 'react';
import { Toaster } from '../ui/toast';
import { RealtimeProvider } from './realtime-provider';
import { TQueryProvider } from './t-query-provider';
import { ThemeProvider } from './theme-provider';

export function Providers({ children }: PropsWithChildren): JSX.Element {
  return (
    <ThemeProvider>
      <TQueryProvider>
        <RealtimeProvider>
          <Toaster />
          {children}
        </RealtimeProvider>
      </TQueryProvider>
    </ThemeProvider>
  );
}
