import QuillEditor from '@/components/common/quillRtx';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';

type PanelProfileVaultRtxDialogProps = {
  children: React.ReactNode;
  content?: string;
};

export const PanelProfileVaultRtxDialog = ({
  children,
  content,
}: PanelProfileVaultRtxDialogProps) => {
  const [emailTemplate, setEmailTemplate] = useState(content ?? '');

  const onQuillChange = (value: string) => {
    setEmailTemplate(value);
  };

  const onCopy = () => {
    navigator.clipboard.writeText(emailTemplate);
    toast.success('Email content copied');
  };

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="w-5xl max-w-[80vw]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <QuillEditor value={content} onChange={onQuillChange} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onCopy}>Copy</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
