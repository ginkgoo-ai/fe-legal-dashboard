'use client';

import Header from '@/components/header';
import { Toaster } from '@/components/ui/sonner';
import { ConfigProvider, theme } from 'antd';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme: nextTheme } = useTheme();
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    setIsDarkMode(
      nextTheme === 'dark' || (nextTheme === 'system' && systemTheme === 'dark')
    );
  }, [nextTheme, systemTheme]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#0061fd',
          fontFamily: "'Poppins', serif",
        },
        components: {
          Button: {
            borderRadius: 12,
          },
          Input: {
            controlHeight: 36,
            borderRadius: 12,
            colorBorder: '#E1E1E2',
            fontSize: 14,
          },
          Select: {
            controlHeight: 36,
            borderRadius: 12,
            colorBorder: '#E1E1E2',
            fontSize: 14,
            padding: 12,
          },
          Form: {
            labelColor: '#1A1A1AB2',
            labelFontSize: 14,
          },
          Breadcrumb: {
            separatorMargin: 4,
            ...(isDarkMode
              ? {
                  lastItemColor: '#f0f0f0',
                  linkColor: '#0061fd',
                  separatorColor: '#f0f0f0',
                }
              : {}),
          },
        },
      }}
    >
      <Header className="fixed left-0 top-0 z-10" />
      <main className="flex h-0 w-[100vw] flex-1 flex-col items-center overflow-y-auto pt-20">
        {children}
      </main>
      <Toaster position="top-center" richColors />
    </ConfigProvider>
  );
}
