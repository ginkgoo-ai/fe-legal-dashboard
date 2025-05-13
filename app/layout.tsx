'use client';

import GlobalManager from '@/customManager/GlobalManager';
import useRequest from '@/hooks/useRequest';
import Tracer from '@/lib/telemetry/tracer';
import { getUserInfo } from '@/service/api';
import { useUserStore } from '@/store';
import '@/style/global.css';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setUserInfo } = useUserStore();
  const router = useRouter();
  // const [loading, setLoading] = useState(false);
  // const [user, setUser] = useState<UserInfo | null>(null);

  // const mockUserInfo = {
  //   id: '1',
  //   name: 'John Doe',
  //   email: 'john.doe@example.com',
  //   avatar: 'https://github.com/shadcn.png',
  //   roles: [{ id: '1', name: 'ADMIN' }],
  //   firstName: 'John',
  //   lastName: 'Doe',
  //   enabled: true,
  //   sub: '1234567890',
  //   fullname: 'John Doe',
  //   logoFileId: '1234567890',
  //   picture: 'https://github.com/shadcn.png',
  // };

  const { loading, data: user } = useRequest(getUserInfo, {
    errorRetryCount: 1,
    immediate: true,
    onSuccess: user => {
      setUserInfo(user);

      const pathname = window.location.pathname;

      if (!user.enabled && pathname !== '/403') {
        router.replace('/403');
      } else if (user.enabled && pathname === '/403') {
        router.replace('/');
      }
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.document.title = GlobalManager.siteName;
      Tracer({
        url: process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT as string,
        serviceName: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME as string,
        attributes: process.env.NEXT_PUBLIC_OTEL_RESOURCE_ATTRIBUTES as string,
      });
    }

    // setUser(mockUserInfo);
    // setUserInfo(mockUserInfo);
  }, []);

  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Domine:wght@400..700&family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="flex h-[100vh] w-[100vw] flex-col">
        {loading || !user ? (
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
