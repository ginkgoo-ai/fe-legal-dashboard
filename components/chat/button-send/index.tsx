import { ArrowUp } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";

interface ButtonSendProps {
  onSubmitForm: () => void;
  value: string;
  uploadQueue: Array<string>;
}

function PureButtonSend(props: ButtonSendProps) {
  const { onSubmitForm, value, uploadQueue } = props;

  return (
    <Button
      data-testid="send-button"
      className="h-fit rounded-full border p-1.5 dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        onSubmitForm?.();
      }}
      disabled={value.length === 0 || uploadQueue.length > 0}
    >
      <ArrowUp size={14} />
    </Button>
  );
}

export const ButtonSend = memo(PureButtonSend, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length) return false;
  if (prevProps.value !== nextProps.value) return false;
  return true;
});
