'use client';

import { Markdown } from '@/components/chat/markdown';
import { PreviewAttachment } from '@/components/chat/preview-attachment';
import { DocumentHeader } from '@/components/chat/preview-header';
import { SheetEditor } from '@/components/chat/sheet-editor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store';
import { ChatMessage, ChatMessagePart } from '@/types/chat';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Phone } from 'lucide-react';
import Image from 'next/image';
import { memo } from 'react';

interface MessagePreviewProps {
  message: ChatMessage;
}

const PurePreviewMessage = (props: MessagePreviewProps) => {
  const { message } = props;

  const { userInfo } = useUserStore();
  const defaultAvatar = '/default.png';

  const renderMessagePartText = (part: ChatMessagePart) => {
    const formattedContent = (part.content || '').replace(/\n/g, '  \n');
    return <Markdown>{formattedContent}</Markdown>;
  };

  const renderMessagePartSheet = (part: ChatMessagePart) => {
    return (
      <div className="flex flex-col">
        <DocumentHeader
          type="sheet"
          title={part.title || ''}
          content={part.content || ''}
          isStreaming={false}
        />
        <SheetEditor content={part.content || ''} />
      </div>
    );
  };

  const renderMessagePartImage = (part: ChatMessagePart) => {
    return (
      <Image src={part.content || ''} alt={part.title || ''} width={300} height={200} />
    );
  };

  const renderMessagePartCard = (part: ChatMessagePart) => {
    const contents = part.content as unknown as Record<string, string>[];

    return contents.map((data: any) => {
      return (
        <Card
          key={data.businessName}
          className="my-2 w-full hover:shadow-md transition-shadow"
        >
          <CardHeader className="space-y-2 px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row md:justify-between md:items-center">
            <CardTitle className="text-base md:text-lg font-semibold mr-4">
              {data.businessName}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground ">
              <span>Lic# {data.licenseNumber}</span>
            </div>
          </CardHeader>
          <CardContent className="px-4 md:px-6 text-sm text-muted-foreground">
            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground">{data.address}</p>
                <p className="text-muted-foreground">
                  {data.city}, {data.state} - {data.zip}
                </p>
              </div>
              <span className="inline-block bg-muted px-2 py-1 rounded-md text-xs md:text-sm">
                {data.classification}
              </span>
            </div>
          </CardContent>
          <CardFooter className="px-4 md:px-6 py-3 border-t text-sm">
            <a
              href={`tel://${data.phoneNumber?.replace(/[^\d]/g, '')}`}
              className="flex items-center w-full justify-between md:justify-start group hover:bg-muted/50 rounded-lg p-2 transition-colors"
            >
              <div className="flex items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted mr-3">
                  <Phone
                    size="14"
                    className="text-foreground group-hover:scale-110 transition-transform"
                  />
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {data.phoneNumber}
                </span>
              </div>
            </a>
          </CardFooter>
        </Card>
      );
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="group/message mx-auto box-border w-full px-[0.125rem]"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn('flex w-full flex-row gap-4', {
            'flex-row': message.role !== 'user',
            'flex-row-reverse': message.role === 'user',
          })}
        >
          {/* Avatar Bot */}
          {message.role === 'assistant' && (
            <div className="ring-border bg-background flex size-8 shrink-0 items-center justify-center rounded-full ring-1">
              <div className="translate-y-px">
                <Bot size={14} />
              </div>
            </div>
          )}
          {/* Avatar User */}
          {message.role === 'user' && (
            <div className="ring-border bg-background flex size-8 shrink-0 items-center justify-center rounded-full ring-1">
              <Avatar className="size-8">
                <AvatarImage src={userInfo?.picture ?? defaultAvatar} />
                <AvatarFallback>{userInfo?.fullname?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          )}
          {/* Content */}
          <div className="flex w-0 flex-1 flex-col gap-4 overflow-hidden">
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div
                data-testid={`message-attachments`}
                className={cn('flex flex-row justify-end gap-2', {
                  'justify-end': message.role === 'user',
                  'justify-start': message.role !== 'user',
                })}
              >
                {message.attachments.map((attachment: any) => (
                  <PreviewAttachment key={attachment.url} attachment={attachment} />
                ))}
              </div>
            )}
            {/* Parts */}
            {message.parts?.map((part: ChatMessagePart, index: number) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              return (
                <div
                  key={key}
                  className={cn('flex flex-row items-start gap-2', {
                    'justify-end': message.role === 'user',
                    'justify-start': message.role !== 'user',
                  })}
                >
                  <div
                    className={cn('flex flex-col overflow-auto', {
                      'bg-primary text-primary-foreground rounded-xl px-3 py-2':
                        message.role === 'user',
                      'text-secondary-foreground bg-secondary rounded-xl px-3 py-2':
                        message.role !== 'user',
                    })}
                  >
                    {(() => {
                      switch (type) {
                        case 'text':
                          return renderMessagePartText(part);
                        case 'sheet':
                          return renderMessagePartSheet(part);
                        case 'image':
                          return renderMessagePartImage(part);
                        case 'card':
                          return renderMessagePartCard(part);
                        default:
                          return null;
                      }
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Block */}
          <div className="bg-background size-8 shrink-0"></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(PurePreviewMessage, (prevProps, nextProps) => {
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

  return true;
});
