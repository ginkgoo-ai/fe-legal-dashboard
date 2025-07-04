import { RJSFEngine } from '@/components/common/formEngine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconEdit, IconIndividualInfo, IconIssueCheck } from '@/components/ui/icon';
import { useEventManager } from '@/hooks/useEventManager';
import { camelToCapitalizedWords } from '@/lib';
import { updateProfileField } from '@/service/api';
import { useProfileStore } from '@/store/profileStore';
import {
  isArray,
  isBoolean,
  isNumber,
  isPlainObject,
  isString,
  upperFirst,
} from 'lodash';
import { Loader2Icon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

type PanelProfileVaultTabContentProps = {
  fieldKey: string;
  data: Record<string, any>;
  caseId: string;
  dummyDataFields?: string[];
};

export const PanelProfileVaultTabContent = ({
  fieldKey,
  data,
  caseId,
  dummyDataFields,
}: PanelProfileVaultTabContentProps) => {
  const [sectionRecord, setSectionRecord] = useState<Record<string, any>>({});

  useEffect(() => {
    if (data) {
      setSectionRecord(analysisData(data));
    }
  }, [data]);

  const analysisData = (params: Record<string, any>) => {
    const results = Object.entries(params).reduce(
      (prev, curr) => {
        const [key, value] = curr;
        if (isPlainObject(value) || isArray(value)) {
          return {
            ...prev,
            [key]: value,
          };
        }
        return {
          ...prev,
          feCustom: {
            ...(prev.feCustom ?? {}),
            [key]: value,
          },
        };
      },
      {} as Record<string, any>
    );
    return results;
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {Object.entries(sectionRecord)
        .sort((a, b) => {
          if (a[0] === 'feCustom') return 1;
          if (b[0] === 'feCustom') return -1;
          return 0;
        })
        .map(([key, value]) => (
          <ProfileSectionEditorCard
            key={key}
            formKey={key}
            formData={value}
            fieldKey={fieldKey}
            caseId={caseId}
            dummyDataFields={dummyDataFields}
          />
        ))}
    </div>
  );
};

const ProfileSectionEditorCard = ({
  formKey,
  formData,
  fieldKey,
  caseId,
  dummyDataFields = [],
}: {
  formKey: string;
  formData: any;
  fieldKey: string;
  caseId: string;
  dummyDataFields?: string[];
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { schema } = useProfileStore();

  const [formSchema, setFormSchema] = useState<any>(null);
  const [RJSFFormData, setRJSFFormData] = useState<any>(null);
  const { emit } = useEventManager('ginkgoo-message', () => {});

  useEffect(() => {
    let _schema: any;
    const definitions = schema?.jsonSchema?.definitions;
    if (!definitions) {
      return;
    }
    const _key = upperFirst(fieldKey);
    if (formKey === 'feCustom') {
      _schema = Object.keys(formData).reduce(
        (prev, curr) => {
          prev.properties[curr] = definitions[_key]?.properties[curr];
          if (!prev.properties[curr]) {
            throw new Error(`Property ${curr} not found in schema`);
          }
          return prev;
        },
        {
          type: 'object',
          properties: {} as any,
          definitions: schema?.jsonSchema.definitions,
        }
      );
    } else if (definitions[_key]?.properties[formKey]) {
      _schema = {
        ...definitions[_key].properties[formKey],
        definitions: schema.jsonSchema.definitions,
      };
    }
    if (_schema) {
      setFormSchema(_schema);
    }
  }, [formKey, formData, schema, fieldKey]);

  useEffect(() => {
    if (formData) {
      setRJSFFormData(formData);
    }
  }, [formData]);

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const _fieldKey = formKey === 'feCustom' ? fieldKey : `${fieldKey}.${formKey}`;
      const res = await updateProfileField(caseId, _fieldKey, data.formData);
      emit({
        type: 'update-case-detail',
      });
      if (res.failedUpdates === 0) {
        toast.success('Updated successfully');
      }
    } catch (error) {
      setSubmitting(false);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const onFormDataChange = useCallback(
    ({ formData }: any, id?: string) => {
      if (id) {
        console.log('Field changed, id: ', id);
      }
      setRJSFFormData(formData);
    },
    [setRJSFFormData]
  );

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 ">
          <h3 className="text-base font-semibold flex-1 flex items-center gap-3 min-h-9">
            <div className="size-7 flex-none text-primary">
              <IconIndividualInfo size={28} />
            </div>
            {formKey === 'feCustom' ? 'Other' : camelToCapitalizedWords(formKey)}
          </h3>
          {!editMode && (
            <Button
              variant={'secondary'}
              size={'icon'}
              className="p-1 hover:text-primary hover:bg-primary/5"
              type="button"
              onClick={handleEdit}
            >
              <IconEdit size={24} className="text-inherit" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-16">
        {!!formSchema && editMode ? (
          <RJSFEngine
            schema={formSchema}
            formData={RJSFFormData}
            onSubmit={handleSubmit}
            onChange={onFormDataChange}
          >
            <div className="flex items-center gap-2 absolute right-6 top-6">
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
            </div>
          </RJSFEngine>
        ) : null}
        {!editMode ? (
          <>
            {Object.entries(formData).map(([key, value]) => (
              <DynamicProfileSection
                key={key}
                fieldKey={key}
                fieldData={value as any}
                dummyDataFields={dummyDataFields}
                rootFieldKey={
                  formKey === 'feCustom' ? fieldKey : `${fieldKey}.${formKey}`
                }
              />
            ))}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
};

const DynamicProfileSection = ({
  fieldData,
  fieldKey,
  dummyDataFields = [],
  rootFieldKey,
  label,
}: {
  fieldData: Record<string, any>;
  fieldKey: string;
  dummyDataFields?: string[];
  rootFieldKey: string;
  label?: string;
}) => {
  const renderField = (
    key: string,
    field: any,
    parentKey: string,
    displayLabel?: string
  ) => {
    const fullKey = `${parentKey}.${key}`;
    const isDummyData = dummyDataFields.includes(fullKey);
    console.log(fullKey);
    if (isString(field) || isBoolean(field) || isNumber(field)) {
      return (
        <div className="flex items-center gap-4 text-base py-2 my-1 border-primary-gray/50 border-b border-dashed">
          <div className="text-primary-gray w-fit min-w-[188px] relative">
            {isDummyData && (
              <div className="absolute -left-8 top-0 bottom-0 my-auto justify-center items-center flex">
                <IconIssueCheck size={20} />
              </div>
            )}
            {camelToCapitalizedWords(displayLabel ?? key)}
          </div>
          <span className="flex-1">{field}</span>
          {isDummyData && (
            <span className="py-1 px-2 rounded text-orange-300 bg-[#FFF9EA] text-xs">
              Dummy Data
            </span>
          )}
        </div>
      );
    }
    if (isPlainObject(field)) {
      return (
        <div className="text-base">
          <div className="text-primary-gray relative w-fit min-w-[188px] border-primary-gray/50 border-b border-dashed py-2 my-1">
            {isDummyData && (
              <div className="absolute -left-8 top-0 bottom-0 my-auto justify-center items-center flex">
                <IconIssueCheck size={20} />
              </div>
            )}
            {camelToCapitalizedWords(displayLabel ?? key)}
          </div>
          <div className="flex flex-col gap-2 pl-8">
            {Object.entries(field).map(([_key, value]) => (
              <DynamicProfileSection
                key={_key}
                fieldKey={_key}
                fieldData={value as any}
                rootFieldKey={parentKey}
                label={_key}
              />
            ))}
          </div>
        </div>
      );
    }
    if (isArray(field)) {
      return (
        <div className="flex flex-col gap-2">
          {field.map((item, index) => (
            <DynamicProfileSection
              key={index}
              fieldKey={index.toString()}
              label={`#${index + 1} ${key}`}
              fieldData={item}
              rootFieldKey={parentKey}
            />
          ))}
        </div>
      );
    }
  };

  return <div>{renderField(fieldKey, fieldData, rootFieldKey, label)}</div>;
};
