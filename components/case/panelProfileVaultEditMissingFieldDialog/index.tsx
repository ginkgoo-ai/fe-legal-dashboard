import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { IconLoader } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { useEventManager } from '@/hooks/useEventManager';
import { camelToCapitalizedWords } from '@/lib';
import { updateMultipleProfileFields } from '@/service/api';
import { cn } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

type PurePanelProfileVaultEditMissingFieldDialogProps = {
  caseId: string;
  visible: boolean;
  field: {
    key: string;
    value: any[];
  } | null;
  onOpenChange: (open: boolean) => void;
};

const encodeFieldPath = (path: string) => path.replaceAll('.', '_');
const decodeFieldPath = (path: string) => path.replaceAll('_', '.');

const getFormDefaultValues = (missingFields?: any[]) => {
  const results = (missingFields ?? []).reduce(
    (prev, curr) => {
      let defaultValue: any;
      if (curr.fieldType === 'string') {
        defaultValue = '';
      } else if (curr.fieldType === 'number') {
        defaultValue = '';
      } else if (curr.fieldType === 'boolean') {
        defaultValue = false;
      }
      return { ...prev, [encodeFieldPath(curr.fieldPath)]: defaultValue };
    },
    {} as Record<string, string>
  );
  return results;
};

const getFormResolver = (missingFields?: any[]) =>
  zodResolver(
    z.object(
      (missingFields ?? []).reduce(
        (prev, curr) => {
          let defaultValidator: any;
          if (curr.fieldType === 'string') {
            defaultValidator = z
              .string()
              .max(255, `${curr.displayName} must be less than 255 characters`);
          } else if (curr.fieldType === 'number') {
            defaultValidator = z
              .number()
              .min(0, `${curr.displayName} must be greater than or equal to 0`);
          } else if (curr.fieldType === 'boolean') {
            defaultValidator = z.boolean();
          }
          return {
            ...prev,
            [encodeFieldPath(curr.fieldPath)]: defaultValidator,
          };
        },
        {} as Record<string, any>
      )
    )
  );

export const PanelProfileVaultEditMissingFieldDialog = ({
  caseId,
  visible,
  field,
  onOpenChange,
}: PurePanelProfileVaultEditMissingFieldDialogProps) => {
  const [submitting, setSubmitting] = useState(false);
  const { emit } = useEventManager('ginkgoo-message', () => {});
  const form = useForm({
    defaultValues: getFormDefaultValues(field?.value),
    resolver: getFormResolver(field?.value),
  });

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const params = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [decodeFieldPath(key), value])
      ) as Record<string, any>;
      const res = await updateMultipleProfileFields(caseId, params);
      emit({
        type: 'update-case-detail',
      });
      if (res.successfulResults.length > 0) {
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
    (field.value ?? []).forEach(({ fieldPath, fieldType, dummyValue }) => {
      const formName = encodeFieldPath(fieldPath);
      const formValue = form.getValues(formName);
      let hasValue = true;
      if (['string', 'number'].includes(fieldType) && !formValue) {
        hasValue = false;
      }
      if (!hasValue) {
        form.setValue(formName, dummyValue);
      }
    });
  };

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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className={cn('grid grid-cols-2 gap-x-4 gap-y-6 w-full mb-4')}>
              {(field?.value ?? []).map(field => {
                return (
                  <FormField
                    control={form.control}
                    name={encodeFieldPath(field.fieldPath)}
                    key={field.fieldPath}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.displayName}</FormLabel>
                        <FormControl>
                          {field.fieldType === 'boolean' ? (
                            <Checkbox
                              className="size-5"
                              {...formField}
                              checked={formField.value === true}
                              onCheckedChange={checked => formField.onChange(checked)}
                            />
                          ) : (
                            <Input
                              placeholder={`Enter ${field.displayName}`}
                              {...formField}
                            />
                          )}
                        </FormControl>
                      </FormItem>
                    )}
                  />
                );
              })}
            </div>
            <DialogFooter>
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
