import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://97d5217a320745e1cd3f48a330b06318@o4511412586086400.ingest.de.sentry.io/4511412599652432",
  tracesSampleRate: 0.1,
  sampleRate: 1.0,
  environment: import.meta.env.MODE,
  enableLogs: true,
  beforeSend(event) {
    if (event.exception?.values?.[0]?.value?.includes("xhr poll error")) {
      return null;
    }
    return event;
  },
});

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
