import { Loader } from "lucide-react";
import { ChatMessageAttachment } from "@/types/chat";

interface PreviewAttachmentProps {
  attachment: ChatMessageAttachment;
  isUploading?: boolean;
}

export const PreviewAttachment = (props: PreviewAttachmentProps) => {
  const { attachment, isUploading = false } = props;
  const { name, contentType, url } = attachment;

  return (
    <div data-testid="input-attachment-preview" className="flex flex-col gap-2">
      <div className="bg-muted relative flex aspect-video h-16 w-20 flex-col items-center justify-center rounded-md">
        {contentType ? (
          contentType.startsWith("image") ? (
            // NOTE: it is recommended to use next/image for images
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt={name ?? "An image attachment"} className="size-full rounded-md object-cover" />
          ) : (
            <div className="" />
          )
        ) : (
          <div className="" />
        )}

        {isUploading && (
          <div data-testid="input-attachment-loader" className="absolute animate-spin text-zinc-500">
            <Loader />
          </div>
        )}
      </div>
      <div className="max-w-16 truncate text-xs text-zinc-500">{name}</div>
    </div>
  );
};
