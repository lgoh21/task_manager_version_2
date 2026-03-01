import type { Metadata } from "next";
import { Newsreader, Outfit, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/hooks/useQueryProvider";
import { AppStoreProvider } from "@/lib/hooks/useAppStore";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthBootstrap } from "@/lib/hooks/useAuthBootstrap";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  adjustFontFallback: false,
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tempus",
  description:
    "Your backlog cleans itself. Your tasks carry forward without judgement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${newsreader.variable} ${outfit.variable} ${ibmPlexMono.variable} font-ui antialiased`}
      >
        <QueryProvider>
          <AppStoreProvider>
            <ToastProvider>
              <AuthBootstrap>{children}</AuthBootstrap>
            </ToastProvider>
          </AppStoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
