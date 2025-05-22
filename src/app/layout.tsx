import CRTEffect from "@/app/components/crt-effect";
import Header from "@/app/components/header";
import SynthwaveBackground from "@/app/components/synthwave-background";
import { Container, Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "animate.css";
import type { Metadata } from "next";
import type React from "react";
import "./globals.css";
import { Provider } from "./provider";

export const metadata: Metadata = {
  title: "Race. Claim. Win",
  description: "Snap answers first, win points. Chaotic and addictive!",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: "#0a0a1f",
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          overflow: "hidden",
        }}
      >
        <Theme>
          <div className="crt-container">
            <div className="crt-content">
              <Provider>
                <SynthwaveBackground />
                <Header />
                <main>
                  <Container>{children}</Container>
                </main>
              </Provider>
            </div>
          </div>
          <CRTEffect />
        </Theme>
      </body>
    </html>
  );
}
