'use client';

import GlobalManager from '@/customManager/GlobalManager';
import { useEventManager } from '@/hooks/useEventManager';
import useRequest from '@/hooks/useRequest';
import { getUserInfo } from '@/service/api';
import { useUserStore } from '@/store';
import { useExtensionsStore } from '@/store/extensionsStore';
import '@/style/global.css';
import { ExtensionsInfo } from '@/types/extensions';
import { Poppins } from 'next/font/google';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const whiteListForNotNeetAuth = ['/403'];

const poppins = Poppins({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  const extensionsInfoRef = useRef<ExtensionsInfo | null>(null);
  const timerRegister = useRef<NodeJS.Timeout | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  const { setUserInfo } = useUserStore();
  const { extensionsInfo, setExtensionsInfo } = useExtensionsStore();

  const { emit } = useEventManager('ginkgo-message', () => {});

  const { data: user } = useRequest(getUserInfo, {
    errorRetryCount: 1,
    immediate: true,
    onSuccess: user => {
      if (!user) {
        return;
      }

      setUserInfo(user);

      if (!user?.enabled && pathname !== '/403') {
        router.replace('/403');
      } else if (user?.enabled && pathname === '/403') {
        router.replace('/');
      }
    },
    onFinally: () => {
      setLoading(false);
    },
  });

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const { origin, data } = event;
      const { type } = data;

      if (type.startsWith('ginkgo-page-')) {
        // 如果是来源自身的消息，则不会处理
        return;
      }

      // 确保消息来源是当前页面 且 目标为 all 或者 page
      if (
        origin === window.location.origin &&
        (/^ginkgo-[^-]+-all-.*$/.test(type) || /^ginkgo-[^-]+-page-.*$/.test(type))
      ) {
        emit(data);

        if (
          type === 'ginkgo-background-page-register' &&
          extensionsInfoRef.current?.version !== data?.version
        ) {
          setExtensionsInfo(data);
        }
      }
    },
    [emit, setExtensionsInfo]
  );

  const postHeartRegister = () => {
    window.postMessage(
      {
        type: 'ginkgo-page-page-register',
      },
      window.location.origin
    );
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.document.title = GlobalManager.siteName;
      window.addEventListener('message', handleMessage);

      postHeartRegister();
      setTimeout(() => {
        postHeartRegister();
      }, 2000);
      timerRegister.current = setInterval(() => {
        postHeartRegister();
      }, 5000);

      // Tracer({
      //   url: process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT as string,
      //   serviceName: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME as string,
      //   attributes: process.env.NEXT_PUBLIC_OTEL_RESOURCE_ATTRIBUTES as string,
      // });
    }

    // 清理监听器
    return () => {
      window?.removeEventListener('message', handleMessage);
      if (timerRegister.current) {
        clearTimeout(timerRegister.current);
      }
    };
  }, [handleMessage]);

  useEffect(() => {
    extensionsInfoRef.current = extensionsInfo;
  }, [extensionsInfo]);

  return (
    <html suppressHydrationWarning lang="en" className={poppins.className}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>

      <body className="flex h-[100vh] w-[100vw] flex-col">
        {loading || (whiteListForNotNeetAuth.includes(pathname) && !user) ? (
          <div className="flex flex-1 h-auto items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        ) : (
          <>{children}</>
        )}
      </body>
    </html>
  );
}
