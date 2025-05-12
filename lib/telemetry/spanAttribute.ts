import { Span } from '@opentelemetry/api';

export const addAttributeOnSpan = (span: Span) => {
  span.setAttribute('app.synthetic_request', 'false');
  return span;
};
