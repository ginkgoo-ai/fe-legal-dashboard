'use client';

import Header from '@/components/header';
import { ConfigProvider } from 'antd';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2C9AFF',
        },
        components: {
          Button: {
            borderRadius: 12,
          },
        },
      }}
    >
      <ThemeProvider defaultTheme="system" storageKey="legal|theme">
        <Header className="fixed left-0 top-0 z-10" />
        <main className="flex h-0 w-[100vw] flex-1 flex-col items-center overflow-y-auto pt-16 bg-[#F2F3F7]">
          {children}
        </main>
        <Toaster position="top-center" />
      </ThemeProvider>
    </ConfigProvider>
  );
}
