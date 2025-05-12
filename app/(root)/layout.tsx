'use client';

import Header from '@/components/header';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="legal|theme">
      <Header className="fixed left-0 top-0 z-10" />
      <main className="flex h-0 w-[100vw] flex-1 flex-col items-center overflow-y-auto pt-16">
        <div className="flex h-0 w-full max-w-[var(--width-max)] flex-1 flex-col px-[var(--width-padding)]">
          {children}
        </div>
      </main>
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}
