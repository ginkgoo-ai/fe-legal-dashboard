'use client';

// import { SuggestedActions } from './suggested-actions';
import equal from 'fast-deep-equal';
import type React from 'react';
import { type ChangeEvent, memo, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useWindowSize } from 'usehooks-ts';
// import { ButtonAttachments } from "@/components/chat/button-attachments";
import { ButtonSend } from '@/components/chat/button-send';
import { ButtonStop } from '@/components/chat/button-stop';
import { PreviewAttachment } from '@/components/chat/preview-attachment';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ChatMessageAttachment, ChatStatus } from '@/types/chat';
import { ButtonSearchToggle } from '../button-search-toggle';

interface InputMultimodalProps {
  value: string;
  status: ChatStatus;
  attachments: Array<ChatMessageAttachment>;
  className?: string;
  onInput: (value: string) => void;
  onSubmit: ({
    value,
    attachments,
  }: {
    value: string;
    attachments: Array<ChatMessageAttachment>;
  }) => void;
  onStop: () => void;
  // 附件
  onAttachmentsChange: (attachments: Array<ChatMessageAttachment>) => void;
  onSubContractors?: (mode: boolean) => void;
}

function PureInputMultimodal(props: InputMultimodalProps) {
  const {
    value,
    status,
    attachments,
    className,
    onInput,
    onSubmit,
    onStop,
    onAttachmentsChange,
    onSubContractors,
  } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '98px';
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || '';
      onInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   setLocalStorageValue(value);
  // }, [value, setLocalStorageValue]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInput(event.target.value);
    adjustHeight();
  };

  const handleSubmitForm = useCallback(() => {
    onSubmit({
      value,
      attachments,
    });

    onAttachmentsChange?.([]);
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [value, attachments, width, onSubmit, onAttachmentsChange]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      console.error('Error uploading files!', error);
      toast.error('Failed to upload file, please try again!');
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map(file => file.name));

      try {
        const uploadPromises = files.map(file => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          attachment => attachment !== undefined
        );

        onAttachmentsChange?.([...attachments, ...successfullyUploadedAttachments]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [attachments, onAttachmentsChange]
  );

  const handleSubContractors = useCallback((mode: boolean) => {
    onSubContractors?.(mode);
  }, []);

  return (
    <div className="relative flex w-full flex-col gap-4">
      {/* {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <SuggestedActions append={append} chatId={chatId} />
        )} */}

      <input
        type="file"
        className="pointer-events-none fixed -left-4 -top-4 size-0.5 opacity-0"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div
          data-testid="attachments-preview"
          className="flex flex-row items-end gap-2 overflow-x-scroll"
        >
          {attachments.map(attachment => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {uploadQueue.map(filename => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <Textarea
        data-testid="multimodal-input"
        ref={textareaRef}
        placeholder="Send a message..."
        value={value}
        onChange={handleInput}
        className={cn(
          'bg-muted max-h-[calc(75dvh)] min-h-[24px] resize-none overflow-hidden rounded-2xl pb-10 !text-base dark:border-zinc-700',
          className
        )}
        rows={2}
        autoFocus
        onKeyDown={event => {
          if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            if (status !== ChatStatus.READY) {
              toast.error('Please wait for the model to finish its response!');
            } else {
              handleSubmitForm();
            }
          }
        }}
      />

      {/* <div className="absolute bottom-0 flex w-fit flex-row justify-start p-2">
        <ButtonAttachments fileInputRef={fileInputRef} status={status} />
      </div> */}

      <div className="absolute bottom-0 left-0 p-2">
        <ButtonSearchToggle onToggle={handleSubContractors} />
      </div>

      <div className="absolute bottom-0 right-0 flex w-fit flex-row justify-end p-2">
        {[ChatStatus.SUBMITTED, ChatStatus.STREAMING].includes(status) ? (
          <ButtonStop onStop={onStop} />
        ) : (
          <ButtonSend
            value={value}
            onSubmitForm={handleSubmitForm}
            uploadQueue={uploadQueue}
          />
        )}
      </div>
    </div>
  );
}

export const InputMultimodal = memo(PureInputMultimodal, (prevProps, nextProps) => {
  if (prevProps.value !== nextProps.value) return false;
  if (prevProps.status !== nextProps.status) return false;
  if (!equal(prevProps.attachments, nextProps.attachments)) return false;

  return true;
});
