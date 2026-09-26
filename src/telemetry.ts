import {WebTracerProvider} from '@opentelemetry/sdk-trace-web'
import {BatchSpanProcessor} from '@opentelemetry/sdk-trace-base'
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-http'
import {registerInstrumentations} from '@opentelemetry/instrumentation'
import {FetchInstrumentation} from '@opentelemetry/instrumentation-fetch'
import {resourceFromAttributes} from '@opentelemetry/resources'
import {ZoneContextManager} from '@opentelemetry/context-zone'

const enabled = import.meta.env.VITE_OTEL_ENABLED === 'true'

if (enabled) {
  // initialize OpenTelemetry
  const resource = resourceFromAttributes({
    "service.name": import.meta.env.VITE_SERVICE_NAME ?? 'globeandcitizen-fe',
    "service.version": import.meta.env.VITE_APP_VERSION ?? 'unknown',
  })

  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: `${import.meta.env.VITE_OTEL_COLLECTOR_URL}/v1/traces`,
        }),
        {
          // Wait 30 seconds between periodic flushes instead of 5 seconds
          scheduledDelayMillis: 30000,
          // Wait until at least 30 spans accumulate before auto-flushing
          maxExportBatchSize: 30,
        }
      ),
    ],
  })

  // Register provider with ZoneContext to ensure context propagation across async boundaries
  provider.register({
    contextManager: new ZoneContextManager(),
  })

  // Register instrumentations for Fetch and XMLHttpRequest to automatically create spans for network requests
  const propagateTraceHeaderCorsUrls = (import.meta.env.VITE_OTEL_PROPAGATE_URLS ?? '')
    .split(',')
    .map((url: string) => url.trim())
    .filter(Boolean)
    .map((url: string) => new RegExp(url))

  const collectorUrl = import.meta.env.VITE_OTEL_COLLECTOR_URL

  const ignoreUrls: (string | RegExp)[] = [
    /.*\/api\/v1\/health.*/,
    /.*\/api\/v1\/ping.*/,
  ]

  if (collectorUrl) {
    ignoreUrls.push(new RegExp(`${collectorUrl}.*`))
  }

  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls,
        ignoreUrls,
      }),
    ],
  })
}
