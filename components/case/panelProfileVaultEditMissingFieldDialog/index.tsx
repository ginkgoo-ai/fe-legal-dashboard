import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { IconLoader } from '@/components/ui/icon';
import { useEventManager } from '@/hooks/useEventManager';
import { camelToCapitalizedWords } from '@/lib';
import { updateMultipleProfileFields } from '@/service/api';
import { FieldDefinition, FormField } from '@/types/formEngine';
import { cn } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { isBoolean, isNumber, isPlainObject, isString } from 'lodash';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { DynamicFormField } from '../../common/formEngine';

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
          } else if (curr.fieldType === 'array') {
            defaultValidator = z.array(z.any());
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

const getFormDefaultValues = (records?: FormField[]) => {
  const results = (records ?? []).map(record => {
    const { fieldType, fieldPath, fieldDefinition } = record;
    if (fieldType === 'string') {
      return {
        [encodeFieldPath(fieldPath)]: '',
      };
    }
    if (fieldType === 'number') {
      return {
        [encodeFieldPath(fieldPath)]: 0,
      };
    }
    if (fieldType === 'boolean') {
      return {
        [encodeFieldPath(fieldPath)]: false,
      };
    }
    if (fieldType === 'object') {
      return {
        [encodeFieldPath(fieldPath)]: generateDefaultValue(fieldDefinition),
      };
    }
    if (fieldType === 'array') {
      return {
        [encodeFieldPath(fieldPath)]: [],
      };
    }
    throw new Error(`Unsupported field type: ${fieldType}`);
  });
  return results.reduce((prev, curr) => ({ ...prev, ...curr }), {});
};

const generateDefaultValue = (config: FieldDefinition): any => {
  const { type, properties, items } = config;
  if (type === 'string') {
    return '';
  }
  if (type === 'number') {
    return 0;
  }
  if (type === 'boolean') {
    return false;
  }
  if (type === 'object') {
    return Object.fromEntries(
      Object.entries(properties ?? {}).map(([key, value]) => [
        encodeFieldPath(key),
        generateDefaultValue(value),
      ])
    );
  }
  if (type === 'array') {
    if (items) {
      return [generateDefaultValue(items)];
    }
    throw new Error(`Array type missing items`);
  }
  return null;
};

export const PanelProfileVaultEditMissingFieldDialog = ({
  caseId,
  visible,
  field,
  onOpenChange,
}: PurePanelProfileVaultEditMissingFieldDialogProps) => {
  const [submitting, setSubmitting] = useState(false);
  const { emit } = useEventManager('ginkgoo-message', () => {});
  const form = useForm({
    defaultValues: {},
  });

  useEffect(() => {
    if (visible && field) {
      const defaultValues = getFormDefaultValues(field?.value);
      form.reset(defaultValues);
    }
  }, [field, form, visible]);

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

  const recordValueReader = (value: any, keys: string[]) => {
    return keys.reduce((acc, key) => acc[key], value);
  };

  const fillDummyData = (dummyData: any, rootFieldPath: string, formField?: any) => {
    const { _f } = formField ?? {};
    if (isPlainObject(_f?.value)) {
      Object.entries(formField)
        .filter(([key]) => key !== '_f')
        .forEach(([_, value]) => {
          fillDummyData(dummyData, rootFieldPath, value);
        });
      return;
    }
    if (isNumber(_f?.value) || isString(_f?.value) || isBoolean(_f?.value)) {
      const key = _f.name.replace(`${rootFieldPath}.`, '');
      form.setValue(
        _f.name as never,
        recordValueReader(dummyData, key.split('.')) as never
      );
    }
  };

  const onFillWithDummyData = () => {
    if (!field) {
      return;
    }
    (field.value ?? []).forEach(_field => {
      const { dummyValue } = _field;
      const value = form.getValues(_field.fieldPath as never);
      if (isPlainObject(dummyValue)) {
        fillDummyData(
          dummyValue,
          _field.fieldPath,
          form.control._fields[_field.fieldPath as string]
        );
      }
      if (
        (isBoolean(dummyValue) || isNumber(dummyValue) || isString(dummyValue)) &&
        !value
      ) {
        form.setValue(_field.fieldPath as never, dummyValue as never);
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
            <div
              className={cn(
                'grid grid-cols-1 gap-x-4 gap-y-6 w-full mb-4 max-h-[80vh] overflow-y-auto px-1'
              )}
            >
              {(field?.value ?? []).map(fieldConfig => {
                return (
                  <div className="border rounded-lg p-4" key={fieldConfig.fieldPath}>
                    <DynamicFormField
                      fieldPath={encodeFieldPath(fieldConfig.fieldPath)}
                      displayName={fieldConfig.displayName}
                      definition={fieldConfig.fieldDefinition}
                      required={fieldConfig.required}
                    />
                  </div>
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
