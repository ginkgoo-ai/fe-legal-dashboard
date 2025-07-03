import Form from '@rjsf/shadcn';
import validator from '@rjsf/validator-ajv8';

type RJSFEngineProps = {
  schema: any;
  uiSchema?: any;
  children?: React.ReactNode;
  [key: string]: any;
};

const baseUiSchema = {
  'ui:classNames': 'RJSF-form',
};

export const RJSFEngine = (props: RJSFEngineProps) => {
  const { children, ...restProps } = props;
  return (
    <Form validator={validator as any} uiSchema={baseUiSchema} {...restProps}>
      {children}
    </Form>
  );
};
