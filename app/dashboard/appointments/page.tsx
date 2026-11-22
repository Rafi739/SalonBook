import type { Metadata } from "next";
import CustomerAppointments from "@/components/customer/customer-appointments";

export const metadata: Metadata = {
  title: "My Appointments",
};

export default function CustomerAppointmentsPage() {
  return <CustomerAppointments />;
}
