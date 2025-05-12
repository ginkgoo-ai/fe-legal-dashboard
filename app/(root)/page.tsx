'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/upload-detail');
  }, []);

  return (
    <div>
      <Link href="/chat-portal">Hello World</Link>
    </div>
  );
}
