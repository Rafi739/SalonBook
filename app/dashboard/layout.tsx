import type { ReactNode } from "react";
import CustomerShell from "@/components/customer/customer-shell";

export default function CustomerDashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <CustomerShell>{children}</CustomerShell>;
}
