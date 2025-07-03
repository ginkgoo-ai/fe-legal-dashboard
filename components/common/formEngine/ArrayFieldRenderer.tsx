import { Button } from '@/components/ui/button';
import { IconPlus } from '@/components/ui/icon';
import { FieldDefinition } from '@/types/formEngine';
import { Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { DynamicFormField } from './DynamicFormField';

export const ArrayFieldRenderer = ({
  fieldPath,
  definition,
  displayName,
}: {
  fieldPath: string;
  definition: FieldDefinition;
  displayName: string;
}) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldPath,
  });

  const addItem = () => {
    const newItem = definition.items?.properties
      ? Object.fromEntries(
          Object.entries(definition.items.properties).map(([key, def]) => [
            key,
            def.type === 'array' ? [] : '',
          ])
        )
      : {};
    append(newItem);
  };

  return (
    <div className="space-y-4 border p-4 rounded-lg">
      {fields.map((field, index) => (
        <div key={field.id} className="border-l-2 pl-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">
              #{index + 1} {displayName}
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="text-red-500"
            >
              <Trash2 size={16} />
            </Button>
          </div>

          {definition.items?.properties && (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(definition.items.properties).map(([key, itemDef]) => (
                <DynamicFormField
                  key={key}
                  fieldPath={`${fieldPath}.${index}.${key}`}
                  displayName={key}
                  definition={itemDef}
                  required={definition.items?.required?.includes(key) || false}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        className="mt-2 text-primary"
      >
        <IconPlus className="mr-2 h-4 w-4" />
        Add Item
      </Button>
    </div>
  );
};
