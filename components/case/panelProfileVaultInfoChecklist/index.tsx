import { buttonVariants } from '@/components/ui/button';
import { IconEdit, IconLoader } from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useEventManager } from '@/hooks/useEventManager';
import { camelToCapitalizedWords } from '@/lib';
import { applyDummyData } from '@/service/api';
import { ICaseProfileChecklistType, ICaseProfileMissingField } from '@/types/case';
import { cn } from '@/utils';
import { Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PanelProfileVaultEditMissingFieldDialog } from '../panelProfileVaultEditMissingFieldDialog';

const PanelProfileVaultInfoTableRow = ({
  caseId,
  rowKey,
  rowValue,
  onEdit,
  afterFillDummyData,
}: {
  caseId: string;
  rowKey: string;
  rowValue: ICaseProfileMissingField[];
  onEdit: (data: { key: string; value: any }) => void;
  afterFillDummyData: () => void;
}) => {
  const [submitting, setSubmitting] = useState(false);

  const onFillDummyData = async () => {
    setSubmitting(true);
    try {
      const res = await applyDummyData(caseId, rowKey);
      if (!res?.success) {
        toast.error(`Failed to update field ${camelToCapitalizedWords(rowKey)}`);
        return;
      }
      toast.success('Updated successfully');
      afterFillDummyData();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">{camelToCapitalizedWords(rowKey)}</div>
      </TableCell>
      <TableCell className="text-right w-20">
        <div className="flex items-center gap-3">
          <Tooltip delayDuration={1000}>
            <TooltipTrigger disabled={submitting}>
              <div
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'text-[#98A1B7] hover:text-primary hover:bg-primary/5'
                )}
                onClick={onFillDummyData}
              >
                {submitting ? (
                  <div className="animate-spin">
                    <IconLoader size={20} />
                  </div>
                ) : (
                  <Zap size={20} />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xl">
              <p className="mb-0">Fill with dummy data</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={1000}>
            <TooltipTrigger disabled={submitting}>
              <div
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'hover:!text-primary text-[#98A1B7] hover:bg-primary/5'
                )}
                onClick={() => onEdit({ key: rowKey, value: rowValue })}
              >
                <IconEdit size={24} className="text-inherit" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xl">
              <p className="mb-0">Complete missing information</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
};

export const PanelProfileVaultInfoChecklist = (
  props: ICaseProfileChecklistType & { caseId: string }
) => {
  const [currentField, setCurrentField] = useState<{ key: string; value: any[] } | null>(
    null
  );
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { emit: emitCase } = useEventManager('ginkgoo-case', () => {});

  const handleEdit = ({ key, value }: { key: string; value: any[] }) => {
    setCurrentField({ key, value });
    setShowEditDialog(true);
  };

  const handleAfterFillDummyData = () => {
    emitCase({
      type: 'update-case-detail',
    });
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Missing Item</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(Object.entries(props.missingFields ?? {}) ?? []).map(
            ([key, value], docIndex) => (
              <PanelProfileVaultInfoTableRow
                key={docIndex}
                caseId={props.caseId}
                rowKey={key}
                rowValue={value}
                onEdit={() => handleEdit({ key, value })}
                afterFillDummyData={() => handleAfterFillDummyData()}
              />
            )
          )}
        </TableBody>
      </Table>
      {showEditDialog && (
        <PanelProfileVaultEditMissingFieldDialog
          caseId={props.caseId}
          visible={showEditDialog}
          field={currentField}
          onOpenChange={setShowEditDialog}
        />
      )}
    </div>
  );
};
