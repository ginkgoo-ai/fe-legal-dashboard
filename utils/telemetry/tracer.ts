import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import {
  detectResources,
  osDetector,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { addAttributeOnSpan } from './spanAttribute';
const {
  VITE_OTEL_EXPORTER_OTLP_ENDPOINT,
  VITE_OTEL_SERVICE_NAME,
  VITE_OTEL_RESOURCE_ATTRIBUTES,
} = (import.meta as any).env;

const Tracer = async () => {
  const { ZoneContextManager } = await import('@opentelemetry/context-zone');

  const defaultResource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: VITE_OTEL_SERVICE_NAME,
    ...(VITE_OTEL_RESOURCE_ATTRIBUTES ?? '').split(',').reduce(
      (prev: Record<string, string>, curr: string) => {
        const [key, value] = curr.split('=');
        return {
          ...prev,
          [key]: value,
        };
      },
      {} as Record<string, string>
    ),
  });

  const osResource = detectResources({ detectors: [osDetector] });

  const provider = new WebTracerProvider({
    resource: defaultResource.merge(osResource),
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: VITE_OTEL_EXPORTER_OTLP_ENDPOINT,
        }),
        {
          scheduledDelayMillis: 1000,
        }
      ),
    ],
  });

  const contextManager = new ZoneContextManager();

  provider.register({
    contextManager,
    propagator: new CompositePropagator({
      propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator()],
    }),
  });

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-xml-http-request': {
          propagateTraceHeaderCorsUrls: /.*/,
          clearTimingResources: true,
          applyCustomAttributesOnSpan(span) {
            addAttributeOnSpan(span);
          },
        },
        '@opentelemetry/instrumentation-user-interaction': {
          shouldPreventSpanCreation(_event, _element, span) {
            addAttributeOnSpan(span);
            return false;
          },
        },
        '@opentelemetry/instrumentation-document-load': {
          applyCustomAttributesOnSpan: {
            documentLoad(span) {
              addAttributeOnSpan(span);
            },
            documentFetch(span) {
              addAttributeOnSpan(span);
            },
            resourceFetch(span) {
              addAttributeOnSpan(span);
            },
          },
        },
      }),
    ],
  });
};

export default Tracer;
