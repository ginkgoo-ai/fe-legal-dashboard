'use client';

import { PreviewMessage } from '@/components/chat/message-preview';
import { ChatMessage } from '@/types/chat';
import { Bot } from 'lucide-react';

export const Greeting = () => {
  const message1: ChatMessage = {
    id: 'message-1',
    role: 'greeting',
    parts: [
      {
        type: 'text',
        content:
          'I need electrical and plumbing contractors in Austin, TX for a commercial renovation',
      },
    ],
  };

  const message2: ChatMessage = {
    id: 'message-2',
    role: 'greeting',
    parts: [
      {
        type: 'text',
        content:
          'Looking for HVAC specialists near Sacramento for a 20-unit apartment complex',
      },
    ],
  };

  return (
    <div className="flex h-full w-full flex-col items-start justify-center">
      <div className="flex w-full flex-col items-center justify-center">
        <Bot className="mt-[1.5rem] h-[2.875rem] w-[2.875rem]" />
        <p className="mt-[1.5rem] text-center text-[1.5rem] font-bold">
          Find Qualified Subcontractors
        </p>
        <p className="mt-[2.25rem] text-center text-[1rem]">
          Tell me about your construction project,
        </p>
        <p className="mt-[0] text-center text-[1rem]">
          including location and requirements.I&apos;ll help you find the right
          subcontractors for the job.
        </p>
      </div>
      <div className="mt-[3rem] w-full">
        <PreviewMessage message={message1} />
      </div>
      <div className="mt-[0.75rem] w-full">
        <PreviewMessage message={message2} />
      </div>
    </div>
  );
};
