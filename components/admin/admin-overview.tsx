
"use client";

import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  LoaderCircle,
  RefreshCw,
  Scissors,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  getAdminDashboardOverview,
  type AdminDashboardOverview,
} from "@/lib/admin-dashboard";

const statisticCards = [
  {
    title: "Total Customers",
    key: "totalCustomers",
    icon: Users,
    description: "Registered customers",
  },
  {
    title: "Total Services",
    key: "totalServices",
    icon: Scissors,
    description: "All salon services",
  },
  {
    title: "Active Services",
    key: "activeServices",
    icon: Activity,
    description: "Available for booking",
  },
  {
    title: "Total Appointments",
    key: "totalAppointments",
    icon: CalendarDays,
    description: "All appointment requests",
  },
  {
    title: "Pending Appointments",
    key: "pendingAppointments",
    icon: Clock3,
    description: "Waiting for review",
  },
  {
    title: "Confirmed Appointments",
    key: "confirmedAppointments",
    icon: CheckCircle2,
    description: "Approved appointments",
  },
  {
    title: "Completed Appointments",
    key: "completedAppointments",
    icon: CheckCircle2,
    description: "Successfully completed",
  },
] as const;

const appointmentStatuses = [
  {
    title: "Pending",
    key: "pendingAppointments",
    color: "bg-amber-500",
    icon: Clock3,
  },
  {
    title: "Confirmed",
    key: "confirmedAppointments",
    color: "bg-emerald-600",
    icon: CheckCircle2,
  },
  {
    title: "Completed",
    key: "completedAppointments",
    color: "bg-sky-600",
    icon: CheckCircle2,
  },
  {
    title: "Cancelled",
    key: "cancelledAppointments",
    color: "bg-rose-500",
    icon: XCircle,
  },
  {
    title: "Rejected",
    key: "rejectedAppointments",
    color: "bg-slate-500",
    icon: XCircle,
  },
] as const;

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function LoadingState() {
  return (
    <div
      className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-card"
      role="status"
      aria-busy="true"
    >
      <LoaderCircle className="animate-spin text-primary" size={30} />
      <p className="text-sm text-muted-foreground">
        Loading your dashboard...
      </p>
    </div>
  );
}

export function AdminOverview() {
  const [overview, setOverview] =
    useState<AdminDashboardOverview | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAdminDashboardOverview();

      setOverview(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while loading the dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchOverview() {
      try {
        const data = await getAdminDashboardOverview();

        if (!cancelled) {
          setOverview(data);
          setError(null);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Something went wrong while loading the dashboard.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchOverview();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !overview) {
    return (
      <section className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-border bg-card px-6 py-12 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-rose-500/10 text-rose-600">
          <AlertCircle size={26} />
        </span>

        <h2 className="mt-5 font-heading text-xl font-semibold">
          Dashboard unavailable
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {error ?? "We could not load your dashboard statistics."}
        </p>

        <button
          type="button"
          onClick={() => void loadOverview()}
          disabled={isLoading}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      </section>
    );
  }

  const maxAppointments = Math.max(overview.totalAppointments, 1);

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            SalonBook Administration
          </p>

          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Dashboard Overview
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Monitor your salon performance and daily activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadOverview()}
          disabled={isLoading}
          className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full border border-border px-4 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw size={15} />
          Refresh data
        </button>
      </section>

      <section
        aria-label="Salon statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {statisticCards.map((card) => {
          const Icon = card.icon;
          const value = overview[card.key];

          return (
            <article
              key={card.key}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>

                  <p className="mt-3 font-heading text-3xl font-semibold tabular-nums">
                    {value.toLocaleString("en-US")}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </div>

                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon size={21} strokeWidth={1.8} />
                </span>
              </div>

              {card.key === "activeServices" && (
                <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                  {overview.inactiveServices.toLocaleString("en-US")} inactive services
                </p>
              )}
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Activity size={21} />
            </span>

            <div>
              <h2 className="font-heading text-xl font-semibold">
                Appointment Status
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Overview of all appointment requests
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-5">
            {appointmentStatuses.map((status) => {
              const Icon = status.icon;
              const value = overview[status.key];

              const percentage =
                overview.totalAppointments > 0
                  ? (value / maxAppointments) * 100
                  : 0;

              return (
                <div key={status.key}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Icon size={16} className="text-muted-foreground" />
                      {status.title}
                    </div>

                    <span className="text-sm font-semibold tabular-nums">
                      {value.toLocaleString("en-US")}
                    </span>
                  </div>

                  <div
                    className="h-2 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label={`${status.title} appointments`}
                    aria-valuemin={0}
                    aria-valuemax={overview.totalAppointments}
                    aria-valuenow={value}
                  >
                    <div
                      className={`h-full rounded-full ${status.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              <DollarSign size={21} />
            </span>

            <div>
              <h2 className="font-heading text-xl font-semibold">
                Revenue Overview
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Recorded payments grouped by currency
              </p>
            </div>
          </div>

          {overview.revenueByCurrency.length > 0 ? (
            <div className="mt-7 space-y-4">
              {overview.revenueByCurrency.map((revenue) => (
                <div
                  key={revenue.currency}
                  className="rounded-2xl border border-border bg-background p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    {revenue.currency} Revenue
                  </p>

                  <p className="mt-2 font-heading text-2xl font-semibold tabular-nums sm:text-3xl">
                    {formatCurrency(revenue.amount, revenue.currency)}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {revenue.transactions.toLocaleString("en-US")} successful transactions
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-7 flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-border px-5 text-center">
              <DollarSign size={27} className="text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">
                No revenue recorded yet
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Revenue will appear here after successful payments.
              </p>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
