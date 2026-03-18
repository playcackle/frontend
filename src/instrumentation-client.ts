// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import("@sentry/nextjs")
  .then((Sentry) => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

      // CRITICAL: 0.1 — never 1.0 for a real-time game app (quota protection)
      tracesSampleRate: 0.1,

      // Capture 100% of errors (only traces are sampled)
      sampleRate: 1.0,

      environment: process.env.NODE_ENV,

      // Enable logs to be sent to Sentry
      enableLogs: true,

      beforeSend(event: Parameters<NonNullable<Parameters<typeof Sentry.init>[0]["beforeSend"]>>[0]) {
        // Drop expected Socket.IO polling noise — not a real error
        if (event.exception?.values?.[0]?.value?.includes("xhr poll error")) {
          return null;
        }
        return event;
      },
    });
  })
  .catch(() => {
    // Sentry not available in this environment — silently skip
  });

export const onRouterTransitionStart = async () => {
  const Sentry = await import("@sentry/nextjs").catch(() => null);
  if (Sentry) Sentry.captureRouterTransitionStart?.();
};
