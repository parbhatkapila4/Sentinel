import * as Sentry from "@sentry/nextjs";

const enablePerformance =
  process.env.NEXT_PUBLIC_SENTRY_ENABLE_PERFORMANCE !== "false";
const performanceSampleRate = parseFloat(
  process.env.SENTRY_PERFORMANCE_SAMPLE_RATE || "0.1"
);

const baseOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: enablePerformance ? performanceSampleRate : 0,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",
};

Sentry.init({
  ...baseOptions,
  integrations: [
    ...Sentry.getDefaultIntegrations(baseOptions),
    Sentry.browserTracingIntegration(),
  ],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by beforeSend signature
  beforeSend(event, hint) {
    if (event.user) {
      event.tags = {
        ...event.tags,
        userId: event.user.id,
      };
    }
    return event;
  },
  beforeSendTransaction(event) {
    if (event.user) {
      event.tags = {
        ...event.tags,
        userId: event.user.id,
      };
    }
    return event;
  },
});
