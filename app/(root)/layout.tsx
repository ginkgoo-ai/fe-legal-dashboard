'use client';

import Header from '@/components/header';
import { ConfigProvider, theme } from 'antd';
import { ThemeProvider, useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme: nextTheme, setTheme } = useTheme();
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDarkMode =
    nextTheme === 'dark' || (nextTheme === 'system' && systemTheme === 'dark');

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#2C9AFF',
        },
        components: {
          Button: {
            borderRadius: 12,
          },
          Input: {
            controlHeight: 58,
            borderRadius: 12,
            colorBorder: '#E1E1E2',
            fontSize: 18,
          },
          Select: {
            controlHeight: 58,
            borderRadius: 12,
            colorBorder: '#E1E1E2',
            fontSize: 18,
            padding: 16,
          },
          Form: {
            labelColor: '#1A1A1AB2',
            labelFontSize: 18,
          },
        },
      }}
    >
      <ThemeProvider defaultTheme="system" storageKey="legal|theme">
        <Header className="fixed left-0 top-0 z-10" />
        <main className="flex h-0 w-[100vw] flex-1 flex-col items-center overflow-y-auto pt-16">
          {children}
        </main>
        <Toaster position="top-center" />
      </ThemeProvider>
    </ConfigProvider>
  );
}
