import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "@/app/globals.css";
import { Provider } from "@/app/provider";
import Header from "@/components/header";
import SynthwaveBackground from "@/components/synthwave-background";
import { Suspense } from "react";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <Theme appearance="dark" hasBackground={false}>
      <div className="crt-container">
        <div className="crt-content">
          <Provider>
            <Suspense fallback={<div>Loading...</div>}>
              <SynthwaveBackground animated={false} />
              <Header />
              <main>
                <Outlet />
              </main>
            </Suspense>
          </Provider>
        </div>
      </div>
    </Theme>
  );
}
