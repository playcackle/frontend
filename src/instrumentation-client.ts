import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://97d5217a320745e1cd3f48a330b06318@o4511412586086400.ingest.de.sentry.io/4511412599652432",

  // CRITICAL: 0.1 — never 1.0 for a real-time game app (quota protection)
  tracesSampleRate: 0.1,

  // Capture 100% of errors (only traces are sampled)
  sampleRate: 1.0,

  environment: process.env.NODE_ENV,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  beforeSend(event) {
    // Drop expected Socket.IO polling noise — not a real error
    if (event.exception?.values?.[0]?.value?.includes("xhr poll error")) {
      return null;
    }
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
