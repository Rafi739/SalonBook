"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  RefreshCw,
  Scissors,
  XCircle,
} from "lucide-react";
import {
  cancelMyAppointment,
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

  if (Number.isNaN(date.getTime())) {
    return value;
  }

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

function AppointmentCard({
  appointment,
  onCancel,
  isCancelling,
}: {
  appointment: CustomerAppointment;
  onCancel: (id: string) => void;
  isCancelling: boolean;
}) {
  const serviceName =
    appointment.service?.serviceName ?? "Service unavailable";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <Scissors className="size-5" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">{serviceName}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {appointment.service?.category || "Salon service"}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {formatPrice(appointment.servicePrice)}
            </p>
          </div>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${
            statusStyles[appointment.status] ?? "bg-slate-100 text-slate-700"
          }`}
        >
          {appointment.status}
        </span>
      </div>

      <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarDays className="size-4 text-slate-400" />
          <span>{formatDate(appointment.appointmentDate)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock3 className="size-4 text-slate-400" />
          <span>{appointment.timeSlot}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Payment:{" "}
          <span
            className={`font-semibold capitalize ${
              appointment.paymentStatus === "paid"
                ? "text-emerald-700"
                : "text-amber-700"
            }`}
          >
            {appointment.paymentStatus}
          </span>
        </p>

        {appointment.status === "pending" && (
          <button
            type="button"
            disabled={isCancelling}
            onClick={() => onCancel(appointment.id)}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <XCircle className="size-4" />
            {isCancelling ? "Cancelling..." : "Cancel appointment"}
          </button>
        )}
      </div>

      {appointment.message && (
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Your message: </span>
          {appointment.message}
        </p>
      )}
    </article>
  );
}

export default function CustomerAppointments() {
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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
          : "Could not load your appointments.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads initial data after mounting.
    void loadAppointments();
  }, [loadAppointments]);

  const handleCancel = async (appointmentId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?",
    );

    if (!confirmed) return;

    setCancellingId(appointmentId);
    setError("");
    setMessage("");

    try {
      await cancelMyAppointment(appointmentId);
      setMessage("Your appointment has been cancelled successfully.");
      await loadAppointments();
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "Could not cancel this appointment.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
            Customer dashboard
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            My Appointments
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            View and manage your salon appointment history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadAppointments()}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {message && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error}
          <button
            type="button"
            onClick={() => void loadAppointments()}
            className="ml-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading your appointments...
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <CalendarDays className="mx-auto size-10 text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No appointments yet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Your salon bookings will appear here after you book a service.
          </p>
          <Link
            href="/services"
            className="mt-5 inline-flex rounded-lg bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Explore services
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {appointments.length} appointment
              {appointments.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="space-y-4">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCancel={handleCancel}
                isCancelling={cancellingId === appointment.id}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
