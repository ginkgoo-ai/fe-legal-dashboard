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
import { updateMultipleProfileFields } from '@/service/api';
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
      const params = Object.fromEntries(
        rowValue.map(({ fieldPath, dummyValue }) => [[fieldPath], dummyValue])
      );
      const res = await updateMultipleProfileFields(caseId, params);
      if (!res || res?.failedResults?.length > 0) {
        toast.error(`Failed to update field ${camelToCapitalizedWords(rowKey)}`);
        return;
      }
      if (res.successfulResults.length > 0) {
        toast.success('Updated successfully');
        afterFillDummyData();
      }
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
  const { emit } = useEventManager('ginkgoo-message', () => {});

  const handleEdit = ({ key, value }: { key: string; value: any[] }) => {
    setCurrentField({ key, value });
    setShowEditDialog(true);
  };

  const handleAfterFillDummyData = () => {
    emit({
      type: 'update-case-detail',
    });
  };

  return (
    <div>
      <h2 className="font-semibold text-base inline-flex items-center w-full gap-2 mb-2">
        <span className="w-fit tracking-wide">Missing Information</span>
        {props.missingFieldsCount > 0 ? (
          <span className="block bg-red-500 rounded-sm h-5 text-white text-sm font-normal flex-none text-center min-w-5 px-1">
            {props.missingFieldsCount}
          </span>
        ) : null}
      </h2>
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F9F9F9] hover:bg-[#F9F9F9]">
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
