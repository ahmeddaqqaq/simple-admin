"use client";

import { usePathname } from "next/navigation";
import Layout from "./Layout";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show layout on login page
  if (pathname === '/') {
    return <>{children}</>;
  }

  return <Layout>{children}</Layout>;
}
