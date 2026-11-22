import type { Metadata } from "next";
import CustomerProfilePageContent from "@/components/customer/customer-profile";

export const metadata: Metadata = {
  title: "My Profile",
};

export default function CustomerProfilePage() {
  return <CustomerProfilePageContent />;
}
