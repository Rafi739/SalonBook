import type { Metadata } from "next"

import { CustomerAppointmentHistory } from "@/components/dashboard/customer-appointment-history"

export const metadata: Metadata = {
  title: "My Appointments",
}

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Your visits</p>
        <h1 className="mt-3 font-heading text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
          My Appointments
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Review your upcoming and past salon visits, including their booking
          and payment status.
        </p>
      </header>

      <section
        aria-label="Appointment list"
        className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-6"
      >
        <CustomerAppointmentHistory />
      </section>
    </div>
  )
}
