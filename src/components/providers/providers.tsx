'use client';

import { type JSX, type PropsWithChildren } from 'react';
import { AppSidebar } from '../sidebar/app-sidebar';
import { SidebarProvider } from '../sidebar/sidebar';
import { ToastProvider } from '../ui/toast';
import { TQueryProvider } from './t-query-provider';
import { ThemeProvider } from './theme-provider';
import { Header } from '../header';

export function Providers({ children }: PropsWithChildren): JSX.Element {
  return (
    <ThemeProvider>
      <TQueryProvider>
        <ToastProvider>
          <SidebarProvider
            style={
              {
                '--sidebar-width': 'calc(var(--spacing) * 72)',
                '--header-height': 'calc(var(--spacing) * 12)',
              } as React.CSSProperties
            }
          >
            <AppSidebar className="bg-(--sidebar-background)" />
            <main className="flex-1">
              <Header />
              {children}
            </main>
          </SidebarProvider>
        </ToastProvider>
      </TQueryProvider>
    </ThemeProvider>
  );
}
