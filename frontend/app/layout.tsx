import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Encrypted Survey System - Privacy-Preserving Voting",
  description: "Collect and analyze privacy-preserving responses with Zama FHEVM. Secure, transparent, and anonymous voting system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <div className="relative min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_55%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.2),_transparent_45%)]" />
            <div className="relative z-10 flex min-h-screen flex-col">
              <Navigation />
              <main className="flex-1 pt-24 pb-8">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
