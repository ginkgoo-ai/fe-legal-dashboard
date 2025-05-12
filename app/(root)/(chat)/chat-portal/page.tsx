'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ChatPortalPage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4 lg:p-12">
      <div className="bg-linear-to-br relative grid h-full w-full grid-cols-1 gap-12 overflow-hidden rounded-3xl from-slate-50 to-slate-300 p-8 lg:grid-cols-2 dark:from-slate-600  dark:to-slate-900">
        <div className="absolute bottom-0 right-0 flex items-center justify-center overflow-hidden lg:static">
          <Image
            src="/worker.png"
            className="max-h-full max-w-full object-contain"
            alt="Worker"
            width={468}
            height={468}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="absolute top-0 flex h-full items-start justify-center p-4 lg:static lg:items-center">
          <div className="max-w-full pt-[10%] lg:max-w-[468px] lg:pt-0 2xl:max-w-[768px]">
            <h1 className="font-domine mb-4 text-5xl font-bold">AI-Powered Solutions</h1>
            <p className="font-outfit mb-12 text-2xl">
              Our AI-driven platform helps you find the best subcontractors quickly and
              efficiently.
            </p>
            <Link
              className={cn(
                buttonVariants({
                  size: 'lg',
                })
              )}
              href="/chat-detail"
              prefetch={true}
            >
              <Plus />
              Start conversation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
