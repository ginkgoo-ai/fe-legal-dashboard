import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { IconEdit, IconIssueCheck, IconPlus, IconTrash } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { useEventManager } from '@/hooks/useEventManager';
import { camelToCapitalizedWords } from '@/lib';
import { getFieldSchema, updateMultipleProfileFields } from '@/service/api';
import { useProfileStore } from '@/store/profileStore';
import { cn } from '@/utils';
import { isArray, isBoolean, isNumber, isObject, isString } from 'lodash';
import { Loader2Icon } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

type PurePanelProfileVaultDynamicTabProps = {
  data: Record<string, unknown>;
  label: string;
  originalKey: string;
  caseId?: string;
};

const generateDynamicSchema = (config: any, prefixKey: string): z.ZodTypeAny => {
  if (isString(config) || isBoolean(config))
    return z.string().min(1, `${prefixKey} is required`);
  if (isNumber(config)) return z.number().min(0, `${prefixKey} must be positive`);
  if (isObject(config)) {
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const [key, value] of Object.entries(config)) {
      shape[key] = generateDynamicSchema(value, `${prefixKey}.${key}`);
    }
    return z.object(shape);
  }
  if (isArray(config)) return z.array(generateDynamicSchema(config, `${prefixKey}.item`));
  throw new Error(`Unsupported type: ${config.type}`);
};

type DynamicFormProps = PurePanelProfileVaultDynamicTabProps & { config: any };

const getAllFormKeys = (item: any): string[] => {
  if (item.formKey) {
    return [];
  }
  if (item.items) {
    return [item.accordionKey].concat(item.items.map(getAllFormKeys).flat());
  }
  if (item.fields) {
    return Object.values(item.fields)
      .map(getAllFormKeys)
      .flat()
      .concat([item.accordionKey]);
  }
  return [];
};

const rebuildFormData = (
  formKey: string,
  parentKey: string,
  data: Record<string, any>
): any => {
  const objectKey = `${parentKey ? parentKey + '.' : ''}${formKey}`;
  if (isString(data) || isNumber(data) || isBoolean(data)) {
    return { [objectKey]: data };
  }
  if (isArray(data)) {
    return {
      [objectKey]: data,
    };
  }
  if (isObject(data)) {
    return Object.keys(data)
      .map((key: string) => {
        return rebuildFormData(key, objectKey, data[key]);
      })
      .reduce((acc, curr) => ({ ...acc, ...curr }), {});
  }
  return null;
};

const genenrateFormConfig = (formKey: string, label: string, data: any): any => {
  if (isString(data)) {
    return {
      type: 'string',
      label,
      formKey,
      defaultValues: data,
    };
  }
  if (isNumber(data)) {
    return {
      type: 'number',
      label,
      formKey,
      defaultValues: data,
    };
  }
  if (isBoolean(data)) {
    return {
      type: 'boolean',
      label,
      formKey,
      defaultValues: data,
    };
  }
  if (isArray(data)) {
    return {
      type: 'array',
      label,
      accordionKey: formKey,
      items: data.map(_ =>
        genenrateFormConfig(formKey, camelToCapitalizedWords(formKey), _)
      ),
    };
  }
  if (isObject(data)) {
    return {
      type: 'object',
      label,
      accordionKey: formKey,
      fields: Object.keys(data).reduce((prev, curr) => {
        return {
          ...prev,
          [curr]: genenrateFormConfig(
            `${formKey}.${curr}`,
            camelToCapitalizedWords(curr),
            (data as any)[curr]
          ),
        };
      }, {}),
    };
  }
  throw new Error('Unsupported data type');
};

const getDefaultValues = (config: any): any => {
  if (config.type === 'string') return ' ';
  if (config.type === 'number') return 0;
  if (config.type === 'object') {
    const defaults: Record<string, any> = {};
    for (const [key, value] of Object.entries(config.fields)) {
      defaults[key] = getDefaultValues(value);
    }
    return defaults;
  }
  if (config.type === 'array') return [getDefaultValues(config.item)];
  throw new Error(`Unsupported type: ${config.type}`);
};

const getDefaultArrayItemBySchema = (
  config: any,
  parentKey: string,
  formKey: string
): any => {
  if (!config) {
    return null;
  }
  if (config.type === 'string') {
    return {
      type: 'string',
      label: camelToCapitalizedWords(formKey),
      formKey: `${parentKey}.${formKey}`,
      defaultValues: '',
    };
  }
  if (config.type === 'object') {
    return {
      type: 'object',
      label: camelToCapitalizedWords(formKey),
      accordionKey: `${parentKey}.${formKey}`,
      fields: Object.keys(config.properties).reduce((prev, curr) => {
        return {
          ...prev,
          [curr]: getDefaultArrayItemBySchema(
            config.properties[curr],
            `${parentKey}.${formKey}`,
            `${curr}`
          ),
        };
      }, {}),
    };
  }
  if (config.type === 'array') {
    return {
      type: 'array',
      accordionKey: `${parentKey}.${formKey}`,
      label: camelToCapitalizedWords(formKey),
      items: [
        getDefaultArrayItemBySchema(config.items, `${parentKey}.${formKey}`, 'item'),
      ],
    };
  }
  throw new Error(`Unsupported type: ${formKey} ${config.type}`);
};

const DynamicForm = ({ label, originalKey, config, caseId, data }: DynamicFormProps) => {
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string[]>([]);
  const { fieldSchema } = useProfileStore();
  const { emit } = useEventManager('ginkgoo-message', () => {});
  console.log(data);
  useEffect(() => {
    if (editMode) {
      const keys = Object.values(config.fields).map(getAllFormKeys).flat();
      setOpenAccordion(keys);
    } else {
      setOpenAccordion([]);
    }
  }, [editMode, config]);

  const formSchema = generateDynamicSchema(config, originalKey);
  type FormValues = z.infer<typeof formSchema>;
  console.log(formSchema);
  const form = useForm<FormValues>({
    defaultValues: {
      [originalKey]: data,
    },
  });
  const toggleAccordion = (key: string) => {
    setOpenAccordion(prev => {
      if (prev.includes(key)) {
        return prev.filter(item => item !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const RenderArrayField = (name: string, fieldConfig: any, level: number) => {
    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name,
    });
    const [loading, setLoading] = useState(false);
    const handleAddControl = async (formKey: string, existedFields: any[]) => {
      const hasSchema = fieldSchema.has(`${caseId}-${formKey}`);
      let newSchema: Record<string, any> = {};
      if (!hasSchema) {
        setLoading(true);
        newSchema = await getFieldSchema(caseId!, formKey);
        setLoading(false);
        fieldSchema.set(`${caseId}-${formKey}`, newSchema);
      } else {
        newSchema = fieldSchema.get(`${caseId}-${formKey}`);
      }
      const newField = getDefaultArrayItemBySchema(
        newSchema.fieldDefinition.items,
        formKey,
        `${existedFields.length}`
      );
      const defaultValue = getDefaultValues(newField);
      append(defaultValue);
      toggleAccordion(newField.accordionKey);
    };

    return (
      <AccordionItem
        value={name}
        className="border-dashed border-[#D8DFF5] border-b last:border-0"
        key={name}
      >
        <AccordionTrigger className="pl-4" onClick={() => toggleAccordion(name)}>
          {fieldConfig.label}
        </AccordionTrigger>
        <AccordionContent>
          <div
            className="flex flex-col gap-y-4"
            style={{
              paddingLeft: (level + 1) * 16 + 'px',
            }}
          >
            <div>
              {fields.map((fieldValue: any, index: number) => {
                const _schema = fieldSchema.get(`${caseId}-${name}`);
                let fieldSchemaItem: ReturnType<typeof getDefaultArrayItemBySchema>;

                if (!_schema) {
                  fieldSchemaItem = genenrateFormConfig(
                    `${name}.${index}`,
                    `${index}`,
                    fieldValue
                  );
                } else {
                  fieldSchemaItem = getDefaultArrayItemBySchema(
                    _schema.fieldDefinition.items,
                    name,
                    `${index}`
                  );
                }

                const uuid = window.crypto.randomUUID();
                return (
                  <div
                    key={uuid}
                    className="border-dashed border-[#D8DFF5] border-b last:border-0"
                  >
                    {RenderField(
                      `${name}.${index}`,
                      {
                        ...fieldSchemaItem,
                        allowRemove: true,
                        removeEvent: () => remove(index),
                      },
                      level + 1
                    )}
                  </div>
                );
              })}
            </div>
            {editMode && (
              <Button
                variant={'outline'}
                size="default"
                className="text-primary w-fit bg-white"
                type="button"
                onClick={() => handleAddControl(name, fields)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2Icon className="mr-2 animate-spin" />
                ) : (
                  <IconPlus className="mr-2" />
                )}
                Add Another {camelToCapitalizedWords(fieldConfig.label)}
              </Button>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  /**
   *
   * @param name
   * @param fieldConfig
   * @param level
   * @returns
   */
  const RenderField = (name: string, fieldConfig: any, level: number) => {
    const { allowRemove, removeEvent } = fieldConfig;
    if (
      fieldConfig.type === 'string' ||
      fieldConfig.type === 'number' ||
      fieldConfig.type === 'boolean'
    ) {
      return (
        <div className={cn('py-4 flex items-center relative pl-4 group/field')}>
          <IconIssueCheck className="absolute -left-2" />
          <div className="text-[#98A1B7] pr-4 w-fit inline-flex items-center gap-1">
            {fieldConfig.label}
          </div>{' '}
          {editMode ? (
            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      {['string', 'number'].includes(fieldConfig.type) ? (
                        <Input
                          className="w-52"
                          placeholder={`Enter ${fieldConfig.label}`}
                          {...field}
                        />
                      ) : (
                        <Checkbox
                          className="size-5"
                          {...field}
                          checked={field.value === true}
                          onCheckedChange={checked => field.onChange(checked)}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {allowRemove && (
                <Button
                  className="hidden group-hover/field:flex items-center justify-center size-6 group/remover hover:bg-red-50"
                  size="icon"
                  variant="ghost"
                  onClick={e => {
                    e.stopPropagation();
                    removeEvent?.();
                  }}
                >
                  <IconTrash className="group-hover/remover:text-red-400" size={20} />
                </Button>
              )}
            </div>
          ) : (
            <span>{(fieldConfig.defaultValues as any).toString()}</span>
          )}
        </div>
      );
    }
    if (fieldConfig.type === 'object') {
      return (
        <AccordionItem
          value={name}
          className={cn(
            'border-dashed border-[#D8DFF5] border-b',
            allowRemove && editMode ? 'group/object' : ''
          )}
          key={name}
          data-value={name}
        >
          <AccordionTrigger className="pl-4" onClick={() => toggleAccordion(name)}>
            <div className="flex items-center gap-8 h-6">
              {fieldConfig.label}
              {allowRemove && editMode && (
                <span
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'icon' }),
                    'hidden group-hover/object:flex items-center justify-center size-6 group/remover hover:bg-red-50'
                  )}
                  onClick={e => {
                    e.stopPropagation();
                    removeEvent?.();
                  }}
                >
                  <IconTrash className="group-hover/remover:text-red-400" size={20} />
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div
              className="border-b border-dashed border-[#D8DFF5] last:border-0"
              style={{
                paddingLeft: (level + 1.5) * 16 + 'px',
              }}
            >
              {Object.keys(fieldConfig.fields)
                .filter(key => key !== 'id')
                .map(key => (
                  <div
                    key={key}
                    className="border-b border-dashed border-[#D8DFF5] last:border-0"
                  >
                    {RenderField(`${name}.${key}`, fieldConfig.fields[key], level + 1)}
                  </div>
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    }
    if (fieldConfig.type === 'array') {
      return <>{RenderArrayField(name, fieldConfig, level)}</>;
    }
    return null;
  };

  const onSubmit = async () => {
    try {
      setSubmitting(false);
      const params = rebuildFormData(originalKey, '', form.getValues(originalKey));
      const res = await updateMultipleProfileFields(caseId!, params);
      if (res.successfulResults.length > 0) {
        toast.success('Updated successfully');
      }
      setSubmitting(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    emit({
      type: 'update-case-detail',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <h3 className="text-lg font-semibold flex-1">{label}</h3>
                {editMode ? (
                  <>
                    <Button
                      variant={'secondary'}
                      size={'default'}
                      type="button"
                      disabled={submitting}
                      onClick={() => handleCancelEdit()}
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full" value={openAccordion}>
                {Object.entries(config.fields).map(([key, value]) => (
                  <div key={key}>{RenderField(`${originalKey}.${key}`, value, 0)}</div>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
};

const PurePanelProfileVaultDynamicTab = (props: PurePanelProfileVaultDynamicTabProps) => {
  const config = genenrateFormConfig(props.originalKey, props.label, props.data);
  return <DynamicForm {...props} config={config} />;
};

export const PanelProfileVaultDynamicTab = memo(PurePanelProfileVaultDynamicTab);
