export type FieldDefinition = {
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  format?: 'date';
  properties?: Record<string, FieldDefinition>;
  items?: FieldDefinition;
  required?: string[];
  minLength?: number;
  maxLength?: number;
};

export type FormField = {
  fieldPath: string;
  displayName: string;
  required: boolean;
  fieldType: string;
  dummyValue: any;
  fieldDefinition: FieldDefinition;
};
