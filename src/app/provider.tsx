import { PerformanceInitializer } from "@/components/performance-initializer";
import { PerformanceModal } from "@/components/performance-modal";
import { Provider as JotaiProvider } from "jotai";
import type React from "react";
import { lazy, Suspense } from "react";

const SentryUserSync = lazy(() =>
  import("@/components/SentryUserSync").then((m) => ({ default: m.SentryUserSync }))
);

type Props = {
  children?: React.ReactNode;
};

export const Provider = ({ children }: Props) => {
  return (
    <JotaiProvider>
      <PerformanceInitializer />
      <Suspense fallback={null}>
        <SentryUserSync />
      </Suspense>
      <PerformanceModal />
      {children}
    </JotaiProvider>
  );
};
