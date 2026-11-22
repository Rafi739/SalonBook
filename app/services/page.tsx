import type { Metadata } from "next"
import { connection } from "next/server"

import { ServicesBrowser } from "@/components/services/services-browser"
import type { ServiceSortOrder } from "@/components/services/service-sort"
import { getServices } from "@/lib/services"

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore SalonBook services for every style, identity, and hair type.",
}

type ServicesPageProps = {
  searchParams: Promise<{
    search?: string
    sort?: string
  }>
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  await connection()

  const [services, params] = await Promise.all([
    getServices(),
    searchParams,
  ])

  const initialSearch = params.search ?? ""
  const allowedSorts: ServiceSortOrder[] = [
    "default",
    "price-asc",
    "price-desc",
  ]
  const initialSort = allowedSorts.includes(params.sort as ServiceSortOrder)
    ? (params.sort as ServiceSortOrder)
    : "default"

  return (
    <>
      <section className="site-container py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl">
          <p className="eyebrow">The service menu</p>
          <h1 className="mt-4 font-heading text-5xl leading-[1.05] font-medium tracking-[-0.055em] sm:text-6xl">
            Find your next
            <br className="hidden sm:block" /> good hair day.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Thoughtful cuts, styling, and self-care for everyone. Search the
            menu and find the services that feel right for you.
          </p>
        </div>

        <div className="mt-10 sm:mt-12">
          <ServicesBrowser
            key={`${initialSearch}:${initialSort}`}
            services={services}
            initialSearch={initialSearch}
            initialSort={initialSort}
          />
        </div>
      </section>
    </>
  )
}
