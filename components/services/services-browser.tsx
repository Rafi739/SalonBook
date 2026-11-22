"use client"

import { useMemo, useState } from "react"

import type { Service, ServiceCategory } from "@/lib/services"

import { ServiceCategoryFilter } from "./service-category-filter"
import { ServiceCard } from "./service-card"
import { ServiceSearch } from "./service-search"
import {
  ServiceEmptyState,
  ServiceNoResultsState,
} from "./service-states"
import { ServiceSort, type ServiceSortOrder } from "./service-sort"

type ServicesBrowserProps = {
  services: Service[]
  initialCategory?: ServiceCategory | "all"
  initialSearch?: string
  initialSort?: ServiceSortOrder
}

export function ServicesBrowser({
  services,
  initialCategory = "all",
  initialSearch = "",
  initialSort = "default",
}: ServicesBrowserProps) {
  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] =
    useState<ServiceCategory | "all">(initialCategory)
  const [sortOrder, setSortOrder] = useState<ServiceSortOrder>(initialSort)

  const hasFilters =
    search.trim().length > 0 ||
    category !== "all" ||
    sortOrder !== "default"

  const filteredServices = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()

    const filtered = services.filter((service) => {
      const matchesSearch = service.name.toLocaleLowerCase().includes(query)
      const matchesCategory = category === "all" || service.category === category

      return matchesSearch && matchesCategory
    })

    if (sortOrder === "price-asc") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortOrder === "price-desc") {
      filtered.sort((a, b) => b.price - a.price)
    }

    return filtered
  }, [category, search, services, sortOrder])

  function clearFilters() {
    setSearch("")
    setCategory("all")
    setSortOrder("default")
  }

  return (
    <section aria-label="Salon services">
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <ServiceSearch value={search} onChange={setSearch} />
          <ServiceSort value={sortOrder} onChange={setSortOrder} />
        </div>

        <div className="mt-5 flex flex-col gap-5 border-t border-border pt-5 sm:flex-row sm:items-end sm:justify-between">
          <ServiceCategoryFilter value={category} onChange={setCategory} />
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasFilters}
            className="min-h-10 self-start text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="mt-7 flex min-h-6 items-center justify-between gap-4">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {filteredServices.length}{" "}
          {filteredServices.length === 1 ? "service" : "services"}
        </p>
      </div>

      {filteredServices.length === 0 ? (
        <div className="mt-5">
          {services.length === 0 ? (
            <ServiceEmptyState />
          ) : (
            <ServiceNoResultsState onClearFilters={clearFilters} />
          )}
        </div>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </section>
  )
}
