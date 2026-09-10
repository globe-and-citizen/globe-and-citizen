import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { ZoneContextManager } from '@opentelemetry/context-zone'

const enabled = import.meta.env.VITE_OTEL_ENABLED === 'true'

if (enabled) {
  // initialize OpenTelemetry
  const resource = resourceFromAttributes({
    "service.name": 'globeandcitizen-fe',
    "service.version": import.meta.env.VITE_APP_VERSION ?? 'unknown',
  })

  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: `${import.meta.env.VITE_OTEL_COLLECTOR_URL}/v1/traces`,
        }),
      ),
    ],
  })

  // Register provider with ZoneContext to ensure context propagation across async boundaries
  provider.register({
    contextManager: new ZoneContextManager(),
  })

  // Register instrumentations for Fetch and XMLHttpRequest to automatically create spans for network requests
  const propagateTraceHeaderCorsUrls =
    import.meta.env.VITE_OTEL_PROPAGATE_URLS
      .split(',')
      .map((url: string) => new RegExp(url.trim()))

  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls,
      }),
      new XMLHttpRequestInstrumentation({
        propagateTraceHeaderCorsUrls,
      }),
    ],
  })
}
