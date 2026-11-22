"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAdminAppointments,
  updateAdminAppointmentStatus,
  type AdminAppointment,
  type AppointmentStatus,
  type AdminAppointmentOptions,
} from "@/lib/admin-appointments";

const statusOptions: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "rejected",
  "cancelled",
  "completed",
];

const statusStyles: Record<AppointmentStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-700",
  completed: "bg-emerald-100 text-emerald-800",
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getAvailableStatuses(status: AppointmentStatus): AppointmentStatus[] {
  switch (status) {
    case "pending":
      return ["confirmed", "rejected", "cancelled"];
    case "confirmed":
      return ["completed", "cancelled"];
    case "rejected":
    case "cancelled":
    case "completed":
      return [];
  }
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const options: AdminAppointmentOptions = {
        page,
        limit: 10,
        sortBy: "appointmentDate",
        sortOrder,
        status: status as AppointmentStatus | "",
        paymentStatus: paymentStatus as "paid" | "unpaid" | "",
        dateFrom,
        dateTo,
      };

      const result = await getAdminAppointments(options);

      setAppointments(result.appointments);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load appointments.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, status, paymentStatus, dateFrom, dateTo, sortOrder]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads initial data after mounting.
    void loadAppointments();
  }, [loadAppointments]);

  async function handleStatusChange(
    appointment: AdminAppointment,
    nextStatus: AppointmentStatus,
  ) {
    const confirmed = window.confirm(
      `Change appointment status from ${appointment.status} to ${nextStatus}?`,
    );

    if (!confirmed) return;

    setUpdatingId(appointment.id);
    setError("");
    setMessage("");

    try {
      await updateAdminAppointmentStatus(appointment.id, nextStatus);
      setMessage("Appointment status updated successfully.");
      await loadAppointments();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update appointment.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function resetFilters() {
    setStatus("");
    setPaymentStatus("");
    setDateFrom("");
    setDateTo("");
    setSortOrder("desc");
    setPage(1);
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-rose-600">
          Administration
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Manage Appointments
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Review customer bookings and manage appointment statuses.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total appointments</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Current page</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {page} <span className="text-lg font-medium text-gray-400">/ {totalPages}</span>
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            Reset filters
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium text-gray-700">
            Appointment status
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
            >
              <option value="">All statuses</option>
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-gray-700">
            Payment status
            <select
              value={paymentStatus}
              onChange={(event) => {
                setPaymentStatus(event.target.value);
                setPage(1);
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
            >
              <option value="">All payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </label>

          <label className="text-sm font-medium text-gray-700">
            Sort appointment date
            <select
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value as "asc" | "desc");
                setPage(1);
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </label>

          <label className="text-sm font-medium text-gray-700">
            Date from
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Date to
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5"
            />
          </label>
        </div>
      </div>

      {message && (
        <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Appointments</h2>
          <button
            type="button"
            onClick={() => void loadAppointments()}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-800">No appointments found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try changing your filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((appointment) => {
              const availableStatuses = getAvailableStatuses(appointment.status);

              return (
                <article key={appointment.id} className="space-y-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.service?.serviceName ?? "Service unavailable"}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {appointment.service?.category ?? "Unknown category"}
                        {appointment.service
                          ? ` · ${appointment.service.duration} minutes`
                          : ""}
                      </p>
                    </div>

                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[appointment.status]}`}>
                      {appointment.status}
                    </span>
                  </div>

                  <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-gray-400">Customer</p>
                      <p className="mt-1 font-medium text-gray-800">
                        {appointment.customer?.name ?? "Customer unavailable"}
                      </p>
                      <p className="break-all text-gray-500">
                        {appointment.customer?.email ?? "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400">Appointment</p>
                      <p className="mt-1 font-medium text-gray-800">
                        {formatDate(appointment.appointmentDate)}
                      </p>
                      <p className="text-gray-500">{appointment.timeSlot}</p>
                    </div>

                    <div>
                      <p className="text-gray-400">Service price</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {formatPrice(appointment.servicePrice)}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400">Payment</p>
                      <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        appointment.paymentStatus === "paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {appointment.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {appointment.message && (
                    <div className="rounded-lg bg-gray-50 p-3 text-sm">
                      <p className="font-medium text-gray-700">Customer message</p>
                      <p className="mt-1 whitespace-pre-wrap text-gray-600">
                        {appointment.message}
                      </p>
                    </div>
                  )}

                  {availableStatuses.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                      <span className="mr-1 text-sm text-gray-500">
                        Update status:
                      </span>
                      {availableStatuses.map((nextStatus) => (
                        <button
                          key={nextStatus}
                          type="button"
                          disabled={updatingId === appointment.id}
                          onClick={() => void handleStatusChange(appointment, nextStatus)}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold capitalize text-gray-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingId === appointment.id
                            ? "Updating..."
                            : nextStatus}
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-5 py-4">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
