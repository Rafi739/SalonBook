"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAdminUsers,
  updateCustomerBlockedState,
  type AdminUser,
  type AdminUserOptions,
} from "@/lib/admin-users";

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"admin" | "customer" | "">("");
  const [blocked, setBlocked] = useState<"all" | "blocked" | "active">("all");
  const [sortBy, setSortBy] = useState<"name" | "email" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const options: AdminUserOptions = {
        page,
        limit: 10,
        search,
        role,
        blocked:
          blocked === "all" ? "" : blocked === "blocked",
        sortBy,
        sortOrder,
      };

      const result = await getAdminUsers(options);

      setUsers(result.users);
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  }, [page, search, role, blocked, sortBy, sortOrder]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads initial data after mounting.
    void loadUsers();
  }, [loadUsers]);

  async function handleBlockToggle(user: AdminUser) {
    const action = user.isBlocked ? "unblock" : "block";

    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) {
      return;
    }

    setUpdatingId(user.id);
    setError("");
    setMessage("");

    try {
      await updateCustomerBlockedState(user.id, !user.isBlocked);
      setMessage(`${user.name} has been ${action}ed successfully.`);
      await loadUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not update customer.");
    } finally {
      setUpdatingId(null);
    }
  }

  function resetFilters() {
    setSearch("");
    setRole("");
    setBlocked("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-rose-600">
          Administration
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Manage Users
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Search customers, review accounts and manage customer access.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total users</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Users on this page</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{users.length}</p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-gray-900">Search and filters</h2>
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
            Search users
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email..."
              maxLength={100}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Account role
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value as typeof role);
                setPage(1);
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
            >
              <option value="">All roles</option>
              <option value="customer">Customers</option>
              <option value="admin">Admins</option>
            </select>
          </label>

          <label className="text-sm font-medium text-gray-700">
            Account status
            <select
              value={blocked}
              onChange={(event) => {
                setBlocked(event.target.value as typeof blocked);
                setPage(1);
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
            >
              <option value="all">All accounts</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </label>

          <label className="text-sm font-medium text-gray-700">
            Sort by
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value as typeof sortBy);
                setPage(1);
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
            >
              <option value="createdAt">Registration date</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
            </select>
          </label>

          <label className="text-sm font-medium text-gray-700">
            Sort order
            <select
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value as typeof sortOrder);
                setPage(1);
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
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
          <h2 className="font-semibold text-gray-900">User directory</h2>
          <button
            type="button"
            onClick={() => void loadUsers()}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No users found. Try changing your search or filters.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((user) => (
              <article
                key={user.id}
                className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt=""
                      className="h-12 w-12 rounded-full bg-gray-100 object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 text-lg font-bold text-rose-700">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900">
                      {user.name}
                    </h3>
                    <p className="break-all text-sm text-gray-500">{user.email}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Joined {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700">
                    {user.role}
                  </span>

                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    user.isBlocked
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>

                  {user.role === "customer" && (
                    <button
                      type="button"
                      disabled={updatingId === user.id}
                      onClick={() => void handleBlockToggle(user)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                        user.isBlocked
                          ? "border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          : "border border-red-300 text-red-700 hover:bg-red-50"
                      }`}
                    >
                      {updatingId === user.id
                        ? "Updating..."
                        : user.isBlocked
                          ? "Unblock"
                          : "Block"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-5 py-4">
          <p className="text-sm text-gray-500">
            {total} users · Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
