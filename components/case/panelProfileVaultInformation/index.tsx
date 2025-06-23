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
import { camelToCapitalizedWords } from '@/lib';
import { ICaseProfileChecklistType, ICaseProfileMissingField } from '@/types/case';
import { memo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const StatusMap: Record<string, string> = {
  NOT_PROVIDED: 'Not Provided yet',
};

const PurePanelProfileVaultInformationItem = ({
  label,
  fields,
}: {
  label: string;
  fields: ICaseProfileMissingField[];
}) => {
  const [editMode, setEditMode] = useState(false);
  const form = useForm({});

  useEffect(() => {
    fields.forEach(field => {
      form.register(field.fieldPath, { value: '' });
    });
  }, [fields]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const onSubmit = async (data: any) => {
    console.log(data);
    setEditMode(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="w-full bg-[#FFF9EA] rounded-xl p-2 tracking-wide">
          <div className="w-full py-2 px-4 flex gap-4">
            <div className="flex-1 flex items-center">
              <h2 className="font-semibold text-base text-primary-label inline-flex items-center">
                {camelToCapitalizedWords(label)}
                {/* <div className="w-fit bg-white rounded px-2 py-1 mx-4 text-[10px] font-thin text-[#FFA800] inline-flex items-center gap-1">
              <IconAvatar />
            </div> */}
              </h2>
            </div>
            <div className="flex-none inline-flex items-start gap-4">
              <div className="h-9 leading-9 text-[#98A1B7] text-xs">
                {StatusMap.NOT_PROVIDED}
              </div>
              {editMode ? (
                <Button variant={'default'} size={'default'} type="submit">
                  Save
                </Button>
              ) : (
                <Button
                  variant={'secondary'}
                  size={'icon'}
                  className="p-1 group/edit"
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
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 p-4 w-full bg-white">
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
                        <Input placeholder={field.displayName} {...formField} />
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
        <span className="flex-1 tracking-wide">Information checklist</span>
      </h2>
      <div className="flex flex-col gap-4">
        {Object.entries(props.missingFields ?? {})
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([key, value], index) => {
            return (
              <PanelProfileVaultInformationItem fields={value} key={index} label={key} />
            );
          })}
      </div>
    </div>
  );
};
