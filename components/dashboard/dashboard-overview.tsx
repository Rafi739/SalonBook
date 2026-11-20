"use client"

import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CircleCheck,
  Clock3,
  LoaderCircle,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { getCustomerAppointmentSummary } from "@/lib/appointment-api"
import { BackendApiError } from "@/lib/backend-api"
import type { AppointmentSummary } from "@/lib/dashboard"
import { useSession } from "@/lib/auth-client"

import { AppointmentList } from "./appointment-list"

const summaryCards = [
  {
    label: "Total appointments",
    key: "total",
    icon: CalendarDays,
  },
  {
    label: "Pending",
    key: "pending",
    icon: Clock3,
  },
  {
    label: "Confirmed",
    key: "confirmed",
    icon: BadgeCheck,
  },
  {
    label: "Completed",
    key: "completed",
    icon: CircleCheck,
  },
] as const

type SummaryState =
  | { kind: "loaded"; requestKey: string; data: AppointmentSummary }
  | { kind: "error"; requestKey: string; message: string }

function getSummaryError(error: unknown) {
  if (error instanceof BackendApiError) {
    return error.message
  }
  if (error instanceof TypeError) {
    return "We couldn't reach the appointment service. Check your connection and try again."
  }
  return "We couldn't load your appointment summary. Please try again."
}

function SummaryLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="flex min-h-40 items-center justify-center gap-3 rounded-2xl border border-border/80 bg-card text-sm text-muted-foreground"
    >
      <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
      Loading appointment totals…
    </div>
  )
}

export function DashboardOverview() {
  const { data: sessionData, isPending } = useSession()
  const [retryCount, setRetryCount] = useState(0)
  const [state, setState] = useState<SummaryState | null>(null)
  const user = sessionData?.user
  const name = user?.name?.trim()
  const requestKey = `${user?.id ?? ""}:${retryCount}`

  useEffect(() => {
    if (isPending || !user?.id) {
      return
    }

    let active = true
    void getCustomerAppointmentSummary().then(
      (data) => {
        if (active) {
          setState({ kind: "loaded", data, requestKey })
        }
      },
      (error: unknown) => {
        if (active) {
          setState({
            kind: "error",
            requestKey,
            message: getSummaryError(error),
          })
        }
      },
    )

    return () => {
      active = false
    }
  }, [isPending, requestKey, user?.id])

  const currentState =
    state?.requestKey === requestKey ? state : null

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Customer dashboard</p>
          <h1 className="mt-3 font-heading text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
            {name ? `Welcome back, ${name}` : "Welcome back"}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Keep your salon visits and account details close at hand.
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Browse services
          <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </header>

      <section aria-labelledby="appointment-summary-heading">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="appointment-summary-heading"
            className="font-heading text-xl font-medium tracking-tight"
          >
            Appointment summary
          </h2>
          <p className="text-xs text-muted-foreground">
            Counts are based on your saved appointment history.
          </p>
        </div>
        {currentState?.kind === "loaded" ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map(({ label, key, icon: Icon }) => (
              <article
                key={key}
                className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    {label}
                  </p>
                  <span className="grid size-9 place-items-center rounded-full bg-secondary text-secondary-foreground">
                    <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                  </span>
                </div>
                <p className="mt-5 font-heading text-3xl font-medium tracking-tight">
                  {currentState.data[key]}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  From your appointment history
                </p>
              </article>
            ))}
          </div>
        ) : currentState === null ? (
          <SummaryLoading />
        ) : (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-5"
          >
            <p className="text-sm text-muted-foreground">
              {currentState.message}
            </p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-4 min-h-10 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Try again
            </button>
          </div>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <section
          aria-labelledby="recent-appointments-heading"
          className="min-w-0 rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-6"
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Your visits</p>
              <h2
                id="recent-appointments-heading"
                className="mt-2 font-heading text-xl font-medium tracking-tight"
              >
                Recent appointments
              </h2>
            </div>
            <Link
              href="/dashboard/appointments"
              className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-muted-foreground underline decoration-accent underline-offset-4 transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              My appointments
              <ArrowUpRight aria-hidden="true" size={15} />
            </Link>
          </div>
          {currentState?.kind === "loaded" ? (
            <AppointmentList
              appointments={currentState.data.recentAppointments}
              compact
            />
          ) : currentState === null ? (
            <div role="status" className="py-8 text-sm text-muted-foreground">
              Loading recent appointments…
            </div>
          ) : (
            <p className="rounded-xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
              Appointment history is unavailable right now. Use the retry
              button above to load it again.
            </p>
          )}
        </section>

        <aside className="flex flex-col justify-between rounded-2xl border border-accent/40 bg-secondary/60 p-6">
          <div>
            <p className="eyebrow">A little time for you</p>
            <h2 className="mt-3 font-heading text-2xl font-medium leading-tight tracking-tight">
              Find a service that fits your day.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Explore the SalonBook service menu and discover what feels right
              for you.
            </p>
          </div>
          <Link
            href="/services"
            className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-semibold transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Explore services
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </aside>
      </div>
    </div>
  )
}
