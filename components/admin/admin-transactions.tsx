"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAdminTransactions,
  type AdminTransaction,
  type AdminTransactionList,
  type TransactionStatus,
} from "@/lib/admin-transactions";

const statusOptions = [
  { label: "All Transactions", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
] as const;

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStatusClasses(status: TransactionStatus): string {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "pending":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    case "failed":
      return "bg-red-50 text-red-700 ring-red-600/20";
    case "refunded":
      return "bg-blue-50 text-blue-700 ring-blue-600/20";
  }
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-gray-950">
        {value}
      </p>
      <p className="mt-2 text-xs text-gray-500">{description}</p>
    </article>
  );
}

function TransactionRow({
  transaction,
}: {
  transaction: AdminTransaction;
}) {
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70">
      <td className="whitespace-nowrap px-5 py-4">
        <p className="font-mono text-xs font-semibold text-gray-800">
          {transaction.id}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {formatDate(transaction.createdAt)}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-gray-900">
          {transaction.customer?.name ?? "Unknown customer"}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {transaction.customer?.email ?? "No email available"}
        </p>
      </td>

      <td className="px-5 py-4">
        {transaction.appointment ? (
          <>
            <p className="text-sm font-medium text-gray-800">
              {formatDate(transaction.appointment.appointmentDate)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {transaction.appointment.timeSlot}
            </p>
          </>
        ) : (
          <span className="text-xs text-gray-400">Unavailable</span>
        )}
      </td>

      <td className="whitespace-nowrap px-5 py-4">
        <span className="text-sm font-bold text-gray-900">
          {formatMoney(transaction.amount, transaction.currency)}
        </span>
      </td>

      <td className="px-5 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${getStatusClasses(transaction.status)}`}
        >
          {transaction.status}
        </span>
      </td>
    </tr>
  );
}

export default function AdminTransactions() {
  const [data, setData] = useState<AdminTransactionList | null>(null);
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await getAdminTransactions({
        page,
        limit: 20,
        status:
          status === "all" ? undefined : (status as TransactionStatus),
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      setData(result);
    } catch (loadError: unknown) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load transactions.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, status, dateFrom, dateTo]);

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads transactions from the API.
  void loadTransactions();
}, [loadTransactions]);

  const summary = useMemo(() => {
    const transactions = data?.transactions ?? [];

    const completed = transactions.filter(
      (item) => item.status === "completed",
    );

    const pending = transactions.filter(
      (item) => item.status === "pending",
    );

    const revenueByCurrency = new Map<string, number>();

    for (const transaction of completed) {
      const currency = transaction.currency.toUpperCase();

      revenueByCurrency.set(
        currency,
        (revenueByCurrency.get(currency) ?? 0) + transaction.amount,
      );
    }

    return {
      total: data?.pagination.total ?? 0,
      completed: completed.length,
      pending: pending.length,
      revenue: Array.from(revenueByCurrency.entries())
        .map(([currency, amount]) => formatMoney(amount, currency))
        .join(" + ") || "—",
    };
  }, [data]);

  function resetFilters() {
    setStatus("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  function applyDateFilters() {
    setPage(1);
    void loadTransactions();
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Finance management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
            Transactions
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Monitor customer payments and transaction history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadTransactions()}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7v5h-5M4 17v-5h5"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.5 9A7 7 0 0 1 18 6l2 2M4 16l2 2a7 7 0 0 0 12.5-3"
            />
          </svg>
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Transactions"
          value={summary.total.toLocaleString()}
          description="Transactions matching current filters"
        />
        <SummaryCard
          title="Completed This Page"
          value={summary.completed.toLocaleString()}
          description="Successfully completed payments"
        />
        <SummaryCard
          title="Pending This Page"
          value={summary.pending.toLocaleString()}
          description="Payments awaiting confirmation"
        />
        <SummaryCard
          title="Revenue This Page"
          value={summary.revenue}
          description="Completed transactions on this page"
        />
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-950">
            Filter transactions
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Narrow down transactions by payment status and date.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-gray-600">
              Payment status
            </span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-gray-600">
              From date
            </span>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-gray-600">
              To date
            </span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />
          </label>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={applyDateFilters}
              disabled={isLoading}
              className="flex-1 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-gray-950">
              Payment history
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {data
                ? `${data.pagination.total.toLocaleString()} transactions found`
                : "Loading transaction records"}
            </p>
          </div>
          <span className="text-xs font-medium text-gray-500">
            Latest transactions first
          </span>
        </div>

        {error ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-red-700">
              Unable to load transactions
            </p>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <button
              type="button"
              onClick={() => void loadTransactions()}
              className="mt-4 rounded-xl bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
              Loading transactions...
            </div>
          </div>
        ) : !data || data.transactions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 10h18M7 15h3" />
              </svg>
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">
              No transactions found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try changing your filters or date range.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-gray-50">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3">Transaction</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Appointment</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
              <p className="text-xs text-gray-500">
                Page {data.pagination.page} of{" "}
                {Math.max(data.pagination.totalPages, 1)}
                {" · "}
                {data.pagination.total.toLocaleString()} total transactions
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!data.pagination.hasPreviousPage || isLoading}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!data.pagination.hasNextPage || isLoading}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
