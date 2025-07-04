'use client';

import Header from '@/components/header';
import { Toaster } from '@/components/ui/sonner';
import { ConfigProvider, theme } from 'antd';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const { theme: nextTheme } = useTheme();
  // const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    // setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    // const handler = (e: MediaQueryListEvent) => {
    //   setSystemTheme(e.matches ? 'dark' : 'light');
    // };
    // mediaQuery.addEventListener('change', handler);
    // return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDarkMode = false;
  // nextTheme === 'dark' || (nextTheme === 'system' && systemTheme === 'dark');

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#0061FD', // '#2C9AFF',
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
        },
      }}
    >
      {/* defaultTheme="system" */}
      <ThemeProvider defaultTheme="light" storageKey="legal|theme">
        <Header className="fixed left-0 top-0 z-10" />
        <main className="flex h-0 w-[100vw] flex-1 flex-col items-center overflow-y-auto pt-20">
          {children}
        </main>
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </ConfigProvider>
  );
}
