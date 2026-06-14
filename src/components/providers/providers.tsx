'use client';

import { type JSX, type PropsWithChildren } from 'react';
import { AppSidebar } from '../sidebar/app-sidebar';
import { SidebarProvider } from '../sidebar/sidebar';
import { ToastProvider } from '../ui/toast';
import { TQueryProvider } from './t-query-provider';
import { ThemeProvider } from './theme-provider';

export function Providers({ children }: PropsWithChildren): JSX.Element {
  return (
    <ThemeProvider>
      <TQueryProvider>
        <ToastProvider>
          <SidebarProvider>
            <AppSidebar />
            {children}
          </SidebarProvider>
        </ToastProvider>
      </TQueryProvider>
    </ThemeProvider>
  );
}
