import { RJSFEngine } from '@/components/common/formEngine';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { IconLoader } from '@/components/ui/icon';
import { useEventManager } from '@/hooks/useEventManager';
import { camelToCapitalizedWords } from '@/lib';
import { updateMultipleProfileFields } from '@/service/api';
import { UiSchema } from '@rjsf/utils';
import { merge } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

type PurePanelProfileVaultEditMissingFieldDialogProps = {
  caseId: string;
  visible: boolean;
  field: {
    key: string;
    value: any[];
  } | null;
  onOpenChange: (open: boolean) => void;
};

const uiSchema: UiSchema = {
  'ui:classNames': 'overflow-y-auto max-h-[70vh]',
};

export const PanelProfileVaultEditMissingFieldDialog = ({
  caseId,
  visible,
  field,
  onOpenChange,
}: PurePanelProfileVaultEditMissingFieldDialogProps) => {
  const [submitting, setSubmitting] = useState(false);
  const { emit } = useEventManager('ginkgoo-message', () => {});
  const [formData, setFormData] = useState<any>();
  const [schemaList, setSchemaList] = useState<any>(null);

  const [key, setKey] = useState(0);

  useEffect(() => {
    const { value } = field ?? {};
    if (!value) {
      return;
    }
    if (value?.length > 0) {
      const result = value.reduce(
        (prev, curr) => {
          prev.properties[curr.fieldPath] = {
            type: [curr.fieldType],
            ...curr.fieldDefinition,
          };
          return prev;
        },
        {
          type: 'object',
          properties: {},
        }
      );
      setSchemaList(result);
    }
  }, [field]);

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const params = { ...data.formData };
      const res = await updateMultipleProfileFields(caseId, params);
      emit({
        type: 'update-case-detail',
      });
      if (res.failedUpdates === 0) {
        toast.success('Updated successfully');
        onOpenChange(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const onFillWithDummyData = () => {
    if (!field) {
      return;
    }
    const dummyValueRecord = Object.fromEntries(
      (field.value ?? []).map(item => [item.fieldPath, item.dummyValue])
    );
    const newData = merge(dummyValueRecord, formData);
    setFormData(newData);
    setKey(pre => pre + 1);
  };

  const onFormDataChange = useCallback(
    ({ formData }: any, id?: string) => {
      if (id) {
        console.log('Field changed, id: ', id);
      }
      setFormData(formData);
    },
    [setFormData]
  );

  if (!field) {
    return null;
  }

  return (
    <Dialog open={visible} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="mb-4">
            {camelToCapitalizedWords(field?.key)}
          </DialogTitle>
        </DialogHeader>

        <div key={key}>
          <RJSFEngine
            schema={schemaList}
            uiSchema={uiSchema as any}
            onSubmit={(data: any) => {
              onSubmit(data);
            }}
            onChange={onFormDataChange}
            formData={formData}
          >
            <DialogFooter className="mt-8">
              <Button
                variant="outline"
                onClick={onFillWithDummyData}
                disabled={submitting}
                type="button"
              >
                Fill with dummy data
              </Button>
              <Button
                type="submit"
                variant="default"
                size="default"
                disabled={submitting}
              >
                {submitting && (
                  <div className="animate-spin">
                    <IconLoader size={14} />
                  </div>
                )}
                Confirm
              </Button>
            </DialogFooter>
          </RJSFEngine>
        </div>
      </DialogContent>
    </Dialog>
  );
};
