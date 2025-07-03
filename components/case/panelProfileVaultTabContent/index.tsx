import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { IconEdit } from '@/components/ui/icon';
import { camelToCapitalizedWords } from '@/lib';
import { isArray, isPlainObject } from 'lodash';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

type PanelProfileVaultTabContentProps = {
  fieldKey: string;
  data: Record<string, any>;
};

export const PanelProfileVaultTabContent = ({
  fieldKey,
  data,
}: PanelProfileVaultTabContentProps) => {
  console.log(fieldKey);
  console.log(data);

  const [sectionRecord, setSectionRecord] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setSectionRecord(analysisData(data));
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
    console.log(results);
    return results;
  };

  const handleCancelEdit = () => {};

  const handleEdit = () => {};

  return (
    <div className="flex flex-col gap-4 w-full">
      {Object.entries(sectionRecord).map(([key, value]) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <h3 className="text-base font-semibold flex-1">
                {camelToCapitalizedWords(key)}
              </h3>
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
        </Card>
      ))}
    </div>
  );
};
