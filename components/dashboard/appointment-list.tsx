import Link from "next/link"
import { CalendarDays } from "lucide-react"

import type {
  AppointmentStatus,
  CustomerAppointment,
  PaymentStatus,
} from "@/lib/dashboard"

const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  rejected: "Rejected",
  cancelled: "Cancelled",
  completed: "Completed",
}

const appointmentStatusStyles: Record<AppointmentStatus, string> = {
  pending: "bg-accent/25 text-foreground",
  confirmed: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  rejected: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
  completed: "bg-secondary text-secondary-foreground",
}

const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
}

const paymentStatusStyles: Record<PaymentStatus, string> = {
  paid: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  unpaid: "bg-accent/25 text-foreground",
}

function formatAppointmentDate(value: string) {
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
  )

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable"
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date)
}

function formatAppointmentPrice(amount: number) {
  if (!Number.isFinite(amount)) {
    return "Price unavailable"
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function StatusBadge({
  label,
  className,
}: {
  label: string
  className: string
}) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}

function NoAppointments() {
  return (
    <div
      role="status"
      className="rounded-2xl border border-dashed border-border bg-background/70 px-5 py-10 text-center sm:px-8"
    >
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
        <CalendarDays aria-hidden="true" size={21} strokeWidth={1.7} />
      </span>
      <h3 className="mt-4 font-heading text-xl font-medium tracking-tight">
        No appointments yet
      </h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        When you book a visit, its details and status will be available here.
      </p>
      <Link
        href="/services"
        className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Browse services
      </Link>
    </div>
  )
}

export function AppointmentList({
  appointments,
  compact = false,
}: {
  appointments: readonly CustomerAppointment[]
  compact?: boolean
}) {
  if (appointments.length === 0) {
    return <NoAppointments />
  }

  const visibleAppointments = compact
    ? appointments.slice(0, 3)
    : appointments

  return (
    <>
      <p className="mb-3 text-xs text-muted-foreground">
        Prices show the saved amount; the API does not include a currency code.
      </p>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
          <caption className="sr-only">Your appointments</caption>
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th scope="col" className="px-4 py-3 font-medium">
                Service
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Date
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Time
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Price
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Payment
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Booking status
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleAppointments.map((appointment) => (
              <tr
                key={appointment.id}
                className="border-b border-border/70 last:border-0"
              >
                <th scope="row" className="px-4 py-4 font-semibold">
                  {appointment.service?.serviceName ?? "Service unavailable"}
                </th>
                <td className="px-4 py-4 text-muted-foreground">
                  {formatAppointmentDate(appointment.appointmentDate)}
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {appointment.timeSlot}
                </td>
                <td className="px-4 py-4 font-medium">
                  {formatAppointmentPrice(appointment.servicePrice)}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge
                    label={paymentStatusLabels[appointment.paymentStatus]}
                    className={paymentStatusStyles[appointment.paymentStatus]}
                  />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge
                    label={appointmentStatusLabels[appointment.status]}
                    className={appointmentStatusStyles[appointment.status]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {visibleAppointments.map((appointment) => (
          <article
            key={appointment.id}
            className="rounded-xl border border-border/80 bg-background p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">
                  {appointment.service?.serviceName ?? "Service unavailable"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatAppointmentDate(appointment.appointmentDate)} ·{" "}
                  {appointment.timeSlot}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold">
                {formatAppointmentPrice(appointment.servicePrice)}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge
                label={paymentStatusLabels[appointment.paymentStatus]}
                className={paymentStatusStyles[appointment.paymentStatus]}
              />
              <StatusBadge
                label={appointmentStatusLabels[appointment.status]}
                className={appointmentStatusStyles[appointment.status]}
              />
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
