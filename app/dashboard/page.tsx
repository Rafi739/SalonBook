import type { Metadata } from "next";
import CustomerOverview from "@/components/customer/customer-overview";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function CustomerDashboardPage() {
  return <CustomerOverview />;
}
