'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/upload-file');
  }, []);

  return (
    <div>
      <Link
        className={cn(
          buttonVariants({
            size: 'lg',
          }),
          'mt-4'
        )}
        href="/upload-file"
        prefetch={true}
      >
        Upload File
      </Link>
    </div>
  );
}
