"use client"

import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CircleCheck,
  Clock3,
} from "lucide-react"
import Link from "next/link"

import { useSession } from "@/lib/auth-client"

import { AppointmentList } from "./appointment-list"

const summaryCards = [
  {
    label: "Total appointments",
    icon: CalendarDays,
  },
  {
    label: "Pending",
    icon: Clock3,
  },
  {
    label: "Confirmed",
    icon: BadgeCheck,
  },
  {
    label: "Completed",
    icon: CircleCheck,
  },
]

export function DashboardOverview() {
  const { data } = useSession()
  const name = data?.user.name?.trim()

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
            Booking totals will appear when account data is connected.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(({ label, icon: Icon }) => (
            <article
              key={label}
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
                <span aria-hidden="true">—</span>
                <span className="sr-only">Not available</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                No verified booking data yet
              </p>
            </article>
          ))}
        </div>
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
          <AppointmentList appointments={null} compact />
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
