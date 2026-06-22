import '../globals.css';
import { SidebarProvider } from '@/src/components/sidebar/sidebar';
import { AppSidebar } from '@/src/components/sidebar/app-sidebar';
import { Header } from '@/src/components/header';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
  );
}
