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

type PanelProfileVaultRtxDialogProps = {
  children: React.ReactNode;
};

export const PanelProfileVaultRtxDialog = ({
  children,
}: PanelProfileVaultRtxDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="w-5xl max-w-[80vw]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <QuillEditor />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
