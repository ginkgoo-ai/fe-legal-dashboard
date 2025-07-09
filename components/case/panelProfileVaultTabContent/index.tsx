import { RJSFEngine } from '@/components/common/formEngine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconEdit, IconIndividualInfo, IconIssueCheck } from '@/components/ui/icon';
import { useEventManager } from '@/hooks/useEventManager';
import { camelToCapitalizedWords } from '@/lib';
import { updateProfileField } from '@/service/api';
import { useProfileStore } from '@/store/profileStore';
import { isArray, isBoolean, isNumber, isPlainObject, isString } from 'lodash';
import { Loader2Icon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

type PanelProfileVaultTabContentProps = {
  caseId: string;
  caseInfo: Record<string, any>;
};

export const PanelProfileVaultTabContent = ({
  caseId,
  caseInfo,
}: PanelProfileVaultTabContentProps) => {
  const { schema } = useProfileStore();
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    if (schema && caseInfo) {
      const list = Object.entries(
        (schema?.jsonSchema?.properties ?? {}) as Record<string, any>
      )
        .map(([key, value]) => {
          const definitionKey = (value['$ref'] ?? '').replace('#/definitions/', '');
          const _schema = schema?.jsonSchema.definitions[definitionKey];
          return {
            ...value,
            value: key,
            label: value['title'] ?? camelToCapitalizedWords(key),
            definition: _schema
              ? { ..._schema, definitions: schema.jsonSchema.definitions }
              : {},
            data: caseInfo.profileDummyData[key],
          };
        })
        .sort((a, b) => a.value.localeCompare(b.value));
      setProperties(list);
    }
  }, [schema, caseInfo]);

  return (
    <div className="w-full flex flex-col gap-4">
      {properties.map(property => (
        <ProfileSectionEditorCard
          key={property.value}
          formKey={property.value}
          formData={property.data}
          definition={property.definition}
          caseId={caseId}
          dummyDataFields={caseInfo.dummyDataFields}
        />
      ))}
    </div>
  );
};

const ProfileSectionEditorCard = ({
  formKey,
  formData,
  caseId,
  dummyDataFields = [],
  definition,
}: {
  formKey: string;
  formData: any;
  caseId: string;
  dummyDataFields?: string[];
  definition: Record<string, any>;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  console.log(definition);
  const [RJSFFormData, setRJSFFormData] = useState<any>(null);
  const { emit } = useEventManager('ginkgoo-message', () => {});

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
      const res = await updateProfileField(caseId, formKey, data.formData);
      emit({
        type: 'update-case-detail',
      });
      if (res.success) {
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
            {camelToCapitalizedWords(formKey)}
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
        {!!definition && editMode ? (
          <RJSFEngine
            schema={definition}
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
            {Object.entries(formData ?? {}).map(([key, value]) => (
              <DynamicProfileSection
                key={key}
                fieldKey={key}
                fieldData={value as any}
                dummyDataFields={dummyDataFields}
                rootFieldKey={formKey}
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

    if (isString(field) || isBoolean(field) || isNumber(field)) {
      return (
        <div className="flex items-center gap-4 text-sm py-2 my-1 border-primary-gray/50 border-b border-dashed">
          <div className="text-primary-gray w-fit min-w-[188px] relative">
            {isDummyData && (
              <div className="absolute -left-8 top-0 bottom-0 my-auto justify-center items-center flex">
                <IconIssueCheck size={20} />
              </div>
            )}
            {camelToCapitalizedWords(displayLabel ?? key)}
          </div>
          <span className="flex-1">{isBoolean(field) ? field.toString() : field}</span>
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
        <div className="text-sm">
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
                rootFieldKey={`${parentKey}.${key}`}
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
