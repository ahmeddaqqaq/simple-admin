import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConditionalLayout } from "@/components/ConditionalLayout";
import { ToastProvider } from "@/lib/providers/toast-provider";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Meal Builder Admin",
  description: "Admin dashboard for Meal Builder",
  manifest: "/manifest.json",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover",
  themeColor: "#4b9f72",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Mobile App Meta */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Favicon and Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />

        {/* Optional: theme color meta for Chrome */}
        <meta
          name="theme-color"
          content={
            typeof metadata.themeColor === "string"
              ? metadata.themeColor
              : "#4b9f72"
          }
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <ToastProvider />
        <AuthProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
