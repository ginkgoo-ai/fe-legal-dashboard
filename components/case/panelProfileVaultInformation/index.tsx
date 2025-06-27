import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { IconEdit } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { useEventManager } from '@/hooks/useEventManager';
import { camelToCapitalizedWords } from '@/lib';
import { updateMultipleProfileFields } from '@/service/api';
import { ICaseProfileChecklistType, ICaseProfileMissingField } from '@/types/case';
import { cn } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { memo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const StatusMap: Record<string, string> = {
  NOT_PROVIDED: 'Not Provided yet',
};

const PurePanelProfileVaultInformationItem = ({
  label,
  fields,
  caseId,
}: {
  caseId: string;
  label: string;
  fields: ICaseProfileMissingField[];
}) => {
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { emit } = useEventManager('ginkgoo-message', () => {});
  const form = useForm({
    defaultValues: fields.reduce(
      (prev, curr) => ({ ...prev, [curr.fieldPath]: '' }),
      {} as Record<string, string>
    ),
    resolver: zodResolver(
      z.object(
        fields.reduce(
          (prev, curr) => ({
            ...prev,
            [curr.fieldPath]: z
              .string()
              .max(255, `${curr.displayName} must be less than 255 characters`)
              .optional(),
          }),
          {} as Record<string, any>
        )
      )
    ),
  });

  const handleEdit = () => {
    setEditMode(true);
    setTimeout(() => {
      form.reset();
      form.clearErrors();
    }, 0);
  };

  const onSubmit = async (data: Record<string, string>) => {
    console.log(data);
    setSubmitting(true);
    try {
      const params = Object.entries(data).reduce(
        (prev, curr) => {
          if (fields.some(field => field.fieldPath === curr[0])) {
            return {
              ...prev,
              [curr[0].replaceAll('-', '.')]: curr[1],
            };
          } else {
            return prev;
          }
        },
        {} as Record<string, any>
      );
      const res = await updateMultipleProfileFields(caseId, params);
      emit({
        type: 'update-case-detail',
      });
      if (res.successfulResults.length > 0) {
        toast.success('Updated successfully');
      }
      setEditMode(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="w-full bg-[#FFF9EA] rounded-xl p-2 tracking-wide">
          <div className="w-full py-2 px-4 flex gap-4">
            <div className="flex-1 flex items-center">
              <h2 className="font-semibold text-base text-primary-label inline-flex items-center">
                {camelToCapitalizedWords(label)}
              </h2>
            </div>
            <div className="flex-none inline-flex items-start gap-4">
              <div className="h-9 leading-9 text-[#98A1B7] text-xs">
                {StatusMap.NOT_PROVIDED}
              </div>
              {editMode ? (
                <>
                  <Button
                    variant={'secondary'}
                    size={'default'}
                    type="button"
                    disabled={submitting}
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={'default'}
                    size={'default'}
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting && <Loader2Icon className="animate-spin" />}
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant={'secondary'}
                  size={'icon'}
                  className="p-1 group/edit"
                  type="button"
                  onClick={handleEdit}
                >
                  <IconEdit
                    size={24}
                    className="group-hover/edit:[&>.path-pen]:fill-primary"
                  />
                </Button>
              )}
            </div>
          </div>
          <div
            className={cn(
              'grid grid-cols-2 gap-x-4 gap-y-6 px-4 w-full bg-white transition-[height] duration-150 overflow-hidden',
              { 'py-4': editMode }
            )}
            style={{
              height: editMode
                ? `${Math.ceil(fields.length / 2) * 86 + (Math.ceil(fields.length / 2) - 1) * 32 + 32}px`
                : 0,
            }}
          >
            {fields.map(field => {
              return (
                <FormField
                  control={form.control}
                  name={field.fieldPath}
                  key={field.fieldPath}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>{field.displayName}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`Enter ${field.displayName}`}
                          {...formField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            })}
          </div>
        </div>
      </form>
    </Form>
  );
};

export const PanelProfileVaultInformationItem = memo(
  PurePanelProfileVaultInformationItem
);

export const PanelProfileVaultInformationChecklist = (
  props: ICaseProfileChecklistType & { caseId: string }
) => {
  return (
    <div>
      <h2 className="font-semibold text-base inline-flex items-center w-full gap-2 mb-2">
        <span className="w-fit tracking-wide">Missing Information</span>
        {props.missingFieldsCount > 0 && (
          <span className="block bg-red-500 rounded-sm h-5 text-white text-sm font-normal flex-none text-center min-w-5 px-1">
            {props.missingFieldsCount}
          </span>
        )}
      </h2>
      <div className="flex flex-col gap-4">
        {Object.entries(props.missingFields ?? {})
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([key, value], index) => {
            const fields = value.map(field => ({
              ...field,
              fieldPath: field.fieldPath.replaceAll('.', '-'),
            }));
            return (
              <PanelProfileVaultInformationItem
                fields={fields}
                key={index}
                label={key}
                caseId={props.caseId}
              />
            );
          })}
      </div>
    </div>
  );
};
