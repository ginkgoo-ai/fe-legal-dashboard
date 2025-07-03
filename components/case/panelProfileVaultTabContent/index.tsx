import { RJSFEngine } from '@/components/common/formEngine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconEdit } from '@/components/ui/icon';
import { useEventManager } from '@/hooks/useEventManager';
import { camelToCapitalizedWords } from '@/lib';
import { updateMultipleProfileFields } from '@/service/api';
import { useProfileStore } from '@/store/profileStore';
import { isArray, isPlainObject, upperFirst } from 'lodash';
import { Loader2Icon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

type PanelProfileVaultTabContentProps = {
  fieldKey: string;
  data: Record<string, any>;
  caseId: string;
};

export const PanelProfileVaultTabContent = ({
  fieldKey,
  data,
  caseId,
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
}: {
  formKey: string;
  formData: any;
  fieldKey: string;
  caseId: string;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { schema } = useProfileStore();

  const [formSchema, setFormSchema] = useState<any>(null);
  const [RJSFFormData, setRJSFFormData] = useState<any>(null);
  const [key, setKey] = useState(0);
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

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const params =
        formKey === 'feCustom'
          ? { ...data.formData }
          : { [formKey]: { ...data.formData } };
      const res = await updateMultipleProfileFields(caseId, params);
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
        <CardTitle className="flex items-center gap-2">
          <h3 className="text-base font-normal flex-1 text-primary">
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
      {!!formSchema && editMode ? (
        <CardContent key={key}>
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
        </CardContent>
      ) : null}
    </Card>
  );
};
