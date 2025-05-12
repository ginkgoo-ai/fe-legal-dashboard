import { Paperclip } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ChatStatus } from "@/types/chat";

interface ButtonAttachmentsProps {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: ChatStatus;
}

function PureButtonAttachments(props: ButtonAttachmentsProps) {
  const { fileInputRef, status } = props;

  return (
    <Button
      data-testid="attachments-button"
      className="h-fit rounded-md rounded-bl-lg p-[7px] hover:bg-zinc-200 dark:border-zinc-700 hover:dark:bg-zinc-900"
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      disabled={status !== ChatStatus.READY}
      variant="ghost"
    >
      <Paperclip size={14} />
    </Button>
  );
}

export const ButtonAttachments = memo(PureButtonAttachments);
