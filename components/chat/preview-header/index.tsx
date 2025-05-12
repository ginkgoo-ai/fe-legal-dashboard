"use client";

import { memo } from "react";
import { FileIcon, ImageIcon, LoaderIcon } from "@/components/ui/icon";
import { ChatMessagePart } from "@/types/chat";

interface DocumentHeaderProps extends ChatMessagePart {
  isStreaming: boolean;
}

const PureDocumentHeader = (props: DocumentHeaderProps) => {
  const { type, title, isStreaming } = props;
  return (
    <div className="flex flex-row items-start justify-between gap-2 rounded-t-2xl border border-b-0 p-4 sm:items-center">
      <div className="flex flex-row items-start gap-3 sm:items-center">
        <div className="text-muted-foreground">
          {isStreaming ? (
            <div className="animate-spin">
              <LoaderIcon />
            </div>
          ) : type === "image" ? (
            <ImageIcon />
          ) : (
            <FileIcon />
          )}
        </div>
        <div className="-translate-y-1 font-medium sm:translate-y-0">{title}</div>
      </div>
      <div className="w-8" />
    </div>
  );
};

export const DocumentHeader = memo(PureDocumentHeader, (prevProps, nextProps) => {
  if (prevProps.title !== nextProps.title) return false;
  if (prevProps.isStreaming !== nextProps.isStreaming) return false;

  return true;
});
