'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/case-portal');
  }, []);

  return (
    <div className="w-full h-full relative">
      {/* <Link
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
      </Link> */}
    </div>
  );
}
