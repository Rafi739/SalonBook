"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Scissors,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  getMyAppointments,
  type CustomerAppointment,
} from "@/lib/customer-dashboard";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-100 text-slate-700",
  rejected: "bg-rose-100 text-rose-800",
  completed: "bg-blue-100 text-blue-800",
};

function formatDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CustomerOverview() {
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await getMyAppointments();
      setAppointments(result.appointments);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load dashboard information.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads initial data after mounting.
    void loadAppointments();
  }, [loadAppointments]);

  const pending = appointments.filter((item) => item.status === "pending").length;
  const confirmed = appointments.filter((item) => item.status === "confirmed").length;
  const completed = appointments.filter((item) => item.status === "completed").length;

  const stats = [
    {
      label: "Total appointments",
      value: appointments.length,
      icon: CalendarCheck,
      style: "bg-rose-50 text-rose-600",
    },
    {
      label: "Pending",
      value: pending,
      icon: CalendarClock,
      style: "bg-amber-50 text-amber-600",
    },
    {
      label: "Confirmed",
      value: confirmed,
      icon: Clock3,
      style: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      style: "bg-blue-50 text-blue-600",
    },
  ];

  const recentAppointments = [...appointments]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
            Your personal space
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Customer Overview
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Keep track of your salon bookings and appointments.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void loadAppointments()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            <Scissors className="size-4" />
            Book a service
          </Link>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadAppointments()}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {isLoading ? "—" : stat.value}
                  </p>
                </div>

                <div className={`flex size-12 items-center justify-center rounded-xl ${stat.style}`}>
                  <Icon className="size-5" />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent appointments
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your latest salon booking activity.
            </p>
          </div>

          <Link
            href="/dashboard/appointments"
            className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-700"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>

        {isLoading ? (
          <p className="py-10 text-center text-sm text-slate-500">
            Loading appointments...
          </p>
        ) : recentAppointments.length === 0 ? (
          <div className="py-10 text-center">
            <CalendarCheck className="mx-auto size-9 text-slate-300" />
            <p className="mt-3 font-medium text-slate-800">
              No appointments yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Book your first salon service to see it here.
            </p>
            <Link
              href="/services"
              className="mt-4 inline-flex rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Explore services
            </Link>
          </div>
        ) : (
          <div className="mt-5 divide-y divide-slate-100">
            {recentAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {appointment.service?.serviceName ?? "Service unavailable"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(appointment.appointmentDate)} · {appointment.timeSlot}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {formatPrice(appointment.servicePrice)}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    statusStyles[appointment.status] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
