import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProvider } from "@/lib/hooks/useQueryProvider";
import { AppStoreProvider } from "@/lib/hooks/useAppStore";
import { ToastProvider } from "@/components/ui/Toast";
import { TaskStoreProvider } from "@/lib/hooks/useTaskStore";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
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
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <AppStoreProvider>
            <ToastProvider>
              <TaskStoreProvider>{children}</TaskStoreProvider>
            </ToastProvider>
          </AppStoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
