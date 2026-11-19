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
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
}

const paymentStatusStyles: Record<PaymentStatus, string> = {
  pending: "bg-accent/25 text-foreground",
  paid: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-muted text-muted-foreground",
}

function formatAppointmentDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable"
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date)
}

function formatAppointmentPrice(appointment: CustomerAppointment) {
  if (!Number.isFinite(appointment.price.amount)) {
    return "Price unavailable"
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: appointment.price.currency,
  }).format(appointment.price.amount)
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

function AppointmentUnavailable() {
  return (
    <div
      role="status"
      className="rounded-2xl border border-dashed border-border bg-background/70 px-5 py-10 text-center sm:px-8"
    >
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
        <CalendarDays aria-hidden="true" size={21} strokeWidth={1.7} />
      </span>
      <h3 className="mt-4 font-heading text-xl font-medium tracking-tight">
        Appointment history isn&apos;t connected yet
      </h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        We don&apos;t have a booking data source to show your appointments, so
        we won&apos;t display sample records. Your real booking history can
        appear here when it is available.
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
  appointments: readonly CustomerAppointment[] | null
  compact?: boolean
}) {
  if (appointments === null) {
    return <AppointmentUnavailable />
  }

  if (appointments.length === 0) {
    return <NoAppointments />
  }

  const visibleAppointments = compact
    ? appointments.slice(0, 3)
    : appointments

  return (
    <>
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
                  {appointment.serviceName}
                </th>
                <td className="px-4 py-4 text-muted-foreground">
                  {formatAppointmentDate(appointment.appointmentDate)}
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {appointment.timeSlot}
                </td>
                <td className="px-4 py-4 font-medium">
                  {formatAppointmentPrice(appointment)}
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
                <h3 className="font-semibold">{appointment.serviceName}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatAppointmentDate(appointment.appointmentDate)} ·{" "}
                  {appointment.timeSlot}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold">
                {formatAppointmentPrice(appointment)}
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
