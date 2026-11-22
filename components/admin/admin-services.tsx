"use client";

import Image from "next/image";
import {
  AlertCircle,
  Clock,
  DollarSign,
  Filter,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  deleteAdminService,
  getAdminServices,
  updateAdminServiceStatus,
  type AdminService,
  type AdminServiceStatus,
} from "@/lib/admin-services";
import {
  formatServiceDuration,
  formatServicePrice,
  type ServiceCategory,
} from "@/lib/services";
import { ServiceForm } from "./service-form";

const categoryLabels: Record<ServiceCategory, string> = {
  mens: "Men&apos;s",
  womens: "Women&apos;s",
  unisex: "Unisex",
};

export function AdminServices() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [category, setCategory] = useState<"all" | ServiceCategory>("all");
  const [status, setStatus] = useState<"all" | AdminServiceStatus>("all");
  const [sort, setSort] = useState<"price_asc" | "price_desc">("price_asc");
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<AdminService | null>(
    null,
  );

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAdminServices({
        limit: 100,
        search: appliedSearch,
        category: category === "all" ? undefined : category,
        status: status === "all" ? undefined : status,
        sort,
      });

      setServices(result.services);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load services.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [appliedSearch, category, status, sort]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads initial data after mounting.
    void loadServices();
  }, [loadServices]);

  function openCreateForm() {
    setEditingService(null);
    setIsFormOpen(true);
    setError(null);
    setMessage(null);
  }

  function openEditForm(service: AdminService) {
    setEditingService(service);
    setIsFormOpen(true);
    setError(null);
    setMessage(null);
  }

  async function handleSaved() {
    setIsFormOpen(false);
    setEditingService(null);
    setMessage("Service saved successfully.");
    await loadServices();
  }

  async function handleStatusChange(service: AdminService) {
    const nextStatus: AdminServiceStatus =
      service.status === "active" ? "inactive" : "active";

    setBusyId(service.id);
    setError(null);
    setMessage(null);

    try {
      await updateAdminServiceStatus(service.id, nextStatus);
      setMessage(`${service.name} is now ${nextStatus}.`);
      await loadServices();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update service status.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(service: AdminService) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${service.name}"?`,
    );

    if (!confirmed) return;

    setBusyId(service.id);
    setError(null);
    setMessage(null);

    try {
      await deleteAdminService(service.id);
      setMessage(`${service.name} was deleted successfully.`);
      await loadServices();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete this service.",
      );
    } finally {
      setBusyId(null);
    }
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(search.trim());
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-rose-600">
            Catalog management
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-950">
            Manage Services
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            View, filter and manage your salon services.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadServices()}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Plus size={17} />
            Add Service
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div id="service-form">
          <ServiceForm
            service={editingService}
            onSaved={handleSaved}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingService(null);
            }}
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total services shown</p>
          <p className="mt-2 text-3xl font-semibold text-gray-950">
            {services.length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active services shown</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">
            {services.filter((service) => service.status === "active").length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inactive services shown</p>
          <p className="mt-2 text-3xl font-semibold text-gray-500">
            {services.filter((service) => service.status === "inactive").length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <Filter size={17} />
          Search and filters
        </div>

        <form
          onSubmit={handleSearch}
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        >
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search service name..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as "all" | ServiceCategory)
            }
            className="rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-rose-400"
          >
            <option value="all">All categories</option>
            <option value="mens">Men&apos;s</option>
            <option value="womens">Women&apos;s</option>
            <option value="unisex">Unisex</option>
          </select>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "all" | AdminServiceStatus)
            }
            className="rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-rose-400"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex gap-2">
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as "price_asc" | "price_desc")
              }
              className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-rose-400"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-gray-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {message && (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          {message}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Service catalog</h2>
          <span className="text-sm text-gray-500">
            {services.length} services
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-lg font-semibold text-gray-800">
              No services found
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Try changing your search or filter options.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {services.map((service) => (
              <article
                key={service.id}
                className="flex flex-col gap-4 p-5 transition hover:bg-gray-50/70 sm:flex-row sm:items-center"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {service.imageUrl ? (
                    <Image
                      src={service.imageUrl}
                      alt={service.name}
                      fill
                      unoptimized
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {service.name}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        service.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {service.status}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    {categoryLabels[service.category]}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <DollarSign size={14} />
                      {formatServicePrice(service.price)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={14} />
                      {formatServiceDuration(service.durationMinutes)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => openEditForm(service)}
                    disabled={busyId === service.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleStatusChange(service)}
                    disabled={busyId === service.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Power size={15} />
                    {service.status === "active" ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(service)}
                    disabled={busyId === service.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
