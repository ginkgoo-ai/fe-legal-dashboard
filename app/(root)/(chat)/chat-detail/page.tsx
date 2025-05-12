'use client';

import { Chat } from '@/components/chat';
import { v4 as uuidv4 } from 'uuid';

export default function ChatDetailPage() {
  return (
    <div className="box-border flex h-0 w-full flex-1 flex-col">
      <Chat chatId={uuidv4()} />
    </div>
  );
}
