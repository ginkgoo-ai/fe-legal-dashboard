import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { camelToCapitalizedWords } from '@/lib';
import { FieldDefinition } from '@/types/formEngine';
import { ControllerRenderProps, FieldValues, useFormContext } from 'react-hook-form';
import { ArrayFieldRenderer } from './ArrayFieldRenderer';

export const DynamicFormField = ({
  fieldPath,
  displayName,
  definition,
  required,
}: {
  fieldPath: string;
  displayName: string;
  definition: FieldDefinition;
  required: boolean;
}) => {
  const { control } = useFormContext();
  const displayLabel = camelToCapitalizedWords(displayName);
  const renderField = (field: ControllerRenderProps<FieldValues, string>) => {
    switch (definition?.type) {
      case 'string':
        if (definition.format === 'date') {
          return (
            <FormControl>
              <DatePicker value={field.value} onChange={field.onChange} />
            </FormControl>
          );
        }
        return (
          <FormControl>
            <Input
              {...field}
              placeholder={`Enter ${displayLabel}`}
              {...{
                minLength: definition?.minLength,
                maxLength: definition?.maxLength ?? 255,
              }}
            />
          </FormControl>
        );

      case 'number':
        return (
          <FormControl>
            <Input {...field} type="number" placeholder={`Enter ${displayLabel}`} />
          </FormControl>
        );

      case 'boolean':
        return (
          <FormControl>
            <Checkbox
              className="size-5"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        );

      case 'array':
        return (
          <ArrayFieldRenderer
            fieldPath={fieldPath}
            definition={definition}
            displayName={displayName}
          />
        );

      case 'object':
        return (
          <div className="space-y-4">
            {definition.properties &&
              Object.entries(definition.properties).map(([key, propDef]) => (
                <DynamicFormField
                  fieldPath={`${fieldPath}.${key}`}
                  displayName={key}
                  key={key}
                  definition={propDef}
                  required={definition.required?.includes(key) || false}
                />
              ))}
          </div>
        );

      default:
        return <Input {...control.register(fieldPath)} />;
    }
  };
  return (
    <FormField
      control={control}
      name={fieldPath}
      render={({ field }) => (
        <FormItem>
          {(!definition ||
            (definition.type !== 'boolean' &&
              definition.type !== 'array' &&
              definition.type !== 'object')) && (
            <>
              <FormLabel>
                {displayLabel}
                {required && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
              {renderField(field)}
            </>
          )}
          {definition?.type === 'object' && (
            <div className="mb-5">
              <div className="mb-4 border-b py-3">
                <FormLabel>
                  {displayLabel}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
              </div>
              {renderField(field)}
            </div>
          )}
          {definition?.type === 'boolean' && (
            <div className="flex items-center space-x-2">
              {renderField(field)}
              <FormLabel>
                {displayLabel}
                {required && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
            </div>
          )}

          {definition?.type === 'array' && (
            <>
              <FormLabel>
                {displayLabel}
                {required && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
              {renderField(field)}
            </>
          )}
        </FormItem>
      )}
    />
  );
};
