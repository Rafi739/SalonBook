"use client"

import Link from "next/link"
import { CalendarDays, Clock3, LoaderCircle } from "lucide-react"
import { useState, type FormEvent } from "react"

import {
  createCustomerAppointment,
} from "@/lib/appointment-api"
import { BackendApiError } from "@/lib/backend-api"
import type { CustomerAppointment } from "@/lib/dashboard"
import { formatServiceDuration, formatServicePrice, type Service } from "@/lib/services"
import { useSession } from "@/lib/auth-client"

function getLocalDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatSavedPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date)
}

function statusLabel(status: CustomerAppointment["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function getSubmissionError(error: unknown) {
  if (error instanceof BackendApiError) {
    return error.message
  }

  if (
    error instanceof Error &&
    error.message.startsWith("Failed to retrieve JWT:")
  ) {
    return "We couldn't verify your sign-in. Please sign out and sign in again."
  }

  if (error instanceof TypeError) {
    return "We couldn't reach the appointment service. Check your connection and try again."
  }

  return "We couldn't confirm your booking. Please try again."
}

function AccountRequired({ callbackUrl }: { callbackUrl: string }) {
  const signInUrl = `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`
  const signUpUrl = `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`

  return (
    <div className="rounded-2xl border border-accent/50 bg-secondary/60 p-6 sm:p-8">
      <p className="eyebrow">One more step</p>
      <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight">
        Sign in to book this service
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        Your booking details will be waiting here after you sign in or create an
        account.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href={signInUrl}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Sign in
        </Link>
        <Link
          href={signUpUrl}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-semibold transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Create an account
        </Link>
      </div>
    </div>
  )
}

export function BookingForm({ service }: { service: Service }) {
  const { data: sessionData, isPending, error: sessionError, refetch } = useSession()
  const [appointmentDate, setAppointmentDate] = useState("")
  const [timeSlot, setTimeSlot] = useState("")
  const [message, setMessage] = useState("")
  const [dateError, setDateError] = useState("")
  const [timeError, setTimeError] = useState("")
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [booking, setBooking] = useState<CustomerAppointment | null>(null)
  const minimumDate = getLocalDateString(new Date())
  const callbackUrl = `/services/${encodeURIComponent(service.id)}/book`

  if (isPending) {
    return (
      <div
        role="status"
        aria-busy="true"
        className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border border-border bg-card text-sm text-muted-foreground"
      >
        <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
        Checking your account…
      </div>
    )
  }

  if (sessionError) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6"
      >
        <h2 className="font-heading text-xl font-medium">
          We couldn&apos;t verify your account
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please try checking your session again before booking.
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-5 min-h-10 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!sessionData?.user) {
    return <AccountRequired callbackUrl={callbackUrl} />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError("")
    setDateError("")
    setTimeError("")

    const today = getLocalDateString(new Date())
    let hasValidationError = false

    if (!appointmentDate || appointmentDate < today) {
      setDateError("Choose today or a future date.")
      hasValidationError = true
    }

    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(timeSlot)) {
      setTimeError("Choose a valid appointment time.")
      hasValidationError = true
    }

    if (message.length > 1000) {
      setFormError("Your message must be 1,000 characters or fewer.")
      hasValidationError = true
    }

    if (hasValidationError) {
      return
    }

    setIsSubmitting(true)
    try {
      const savedAppointment = await createCustomerAppointment({
        serviceId: service.id,
        appointmentDate,
        timeSlot,
        ...(message.trim() ? { message: message.trim() } : {}),
      })
      setBooking(savedAppointment)
    } catch (error) {
      setFormError(getSubmissionError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (booking) {
    return (
      <section
        aria-live="polite"
        className="rounded-2xl border border-emerald-700/20 bg-emerald-700/5 p-6 sm:p-8"
      >
        <p className="eyebrow">Booking received</p>
        <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight">
          Your appointment request is in
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {booking.status === "pending"
            ? "Your request is pending while the salon reviews and confirms it."
            : `The appointment was saved with a ${statusLabel(booking.status).toLowerCase()} status.`}
        </p>
        <dl className="mt-6 grid gap-4 rounded-xl border border-border/70 bg-background/70 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Service</dt>
            <dd className="mt-1 font-medium">
              {booking.service?.serviceName ?? service.name}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Date and time</dt>
            <dd className="mt-1 font-medium">
              {formatDate(booking.appointmentDate)} · {booking.timeSlot}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Saved service amount</dt>
            <dd className="mt-1 font-medium">
              {formatSavedPrice(booking.servicePrice)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Booking status</dt>
            <dd className="mt-1 font-medium">
              {statusLabel(booking.status)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          The backend confirms the saved amount but does not return a currency
          code.
        </p>
        <Link
          href="/dashboard/appointments"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          View my appointments
        </Link>
      </section>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-8"
    >
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <p className="eyebrow">Your visit</p>
          <h2 className="mt-2 font-heading text-2xl font-medium tracking-tight">
            Request an appointment
          </h2>
        </div>
        <div className="rounded-xl bg-secondary/70 px-4 py-3 text-right">
          <p className="text-xs text-muted-foreground">Service amount</p>
          <p className="mt-1 font-semibold">{formatServicePrice(service.price)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatServiceDuration(service.durationMinutes)}
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="appointment-date" className="block text-sm font-medium">
            Appointment date <span aria-hidden="true">*</span>
          </label>
          <div className="relative mt-2">
            <CalendarDays
              aria-hidden="true"
              size={17}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="appointment-date"
              className="auth-field pl-10"
              type="date"
              name="appointmentDate"
              min={minimumDate}
              required
              value={appointmentDate}
              aria-invalid={Boolean(dateError)}
              aria-describedby={dateError ? "appointment-date-error" : undefined}
              onChange={(event) => {
                setAppointmentDate(event.currentTarget.value)
                setDateError("")
              }}
            />
          </div>
          {dateError ? (
            <p id="appointment-date-error" className="mt-2 text-sm text-destructive">
              {dateError}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="appointment-time" className="block text-sm font-medium">
            Preferred time <span aria-hidden="true">*</span>
          </label>
          <div className="relative mt-2">
            <Clock3
              aria-hidden="true"
              size={17}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="appointment-time"
              className="auth-field pl-10"
              type="time"
              name="timeSlot"
              step={60}
              required
              value={timeSlot}
              aria-invalid={Boolean(timeError)}
              aria-describedby={
                timeError ? "appointment-time-error" : "appointment-time-help"
              }
              onChange={(event) => {
                setTimeSlot(event.currentTarget.value)
                setTimeError("")
              }}
            />
          </div>
          {timeError ? (
            <p id="appointment-time-error" className="mt-2 text-sm text-destructive">
              {timeError}
            </p>
          ) : (
            <p id="appointment-time-help" className="mt-2 text-xs text-muted-foreground">
              This is a requested time; the salon will confirm availability.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="appointment-message" className="block text-sm font-medium">
          Message <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="appointment-message"
          className="auth-field min-h-28 resize-y py-3"
          name="message"
          maxLength={1000}
          value={message}
          onChange={(event) => setMessage(event.currentTarget.value)}
          placeholder="Anything you'd like the salon to know?"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {message.length}/1,000 characters
        </p>
      </div>

      {formError ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {formError}
          {formError.includes("Sign in again") ? (
            <>
              {" "}
              <Link
                href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-semibold underline underline-offset-2"
              >
                Sign in
              </Link>
            </>
          ) : null}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />
            Sending request…
          </>
        ) : (
          "Request appointment"
        )}
      </button>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        Your request will be pending until the salon confirms it. Prices shown
        here are supplied by the backend and do not include a currency code.
      </p>
    </form>
  )
}
