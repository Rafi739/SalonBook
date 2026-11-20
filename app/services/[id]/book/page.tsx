import Link from "next/link"
import { notFound } from "next/navigation"
import { connection } from "next/server"
import type { Metadata } from "next"

import { BookingForm } from "@/components/services/booking-form"
import { ServiceImage } from "@/components/services/service-image"
import {
  formatServiceDuration,
  formatServicePrice,
  getServiceById,
} from "@/lib/services"

export const metadata: Metadata = {
  title: "Book an appointment",
}

const categoryLabels = {
  mens: "Men's",
  womens: "Women's",
  unisex: "Unisex",
} as const

export default async function BookServicePage({
  params,
}: PageProps<"/services/[id]/book">) {
  await connection()
  const { id } = await params
  const service = await getServiceById(id)

  if (!service) {
    notFound()
  }

  return (
    <section className="site-container py-10 sm:py-14 lg:py-20">
      <Link
        href={`/services/${encodeURIComponent(service.id)}`}
        className="inline-flex min-h-10 items-center text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        Back to service details
      </Link>
      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-10">
        <aside className="space-y-5 lg:sticky lg:top-24">
          <ServiceImage
            name={service.name}
            imageUrl={service.imageUrl}
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
            <span className="inline-flex rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              {categoryLabels[service.category]}
            </span>
            <h1 className="mt-4 font-heading text-2xl font-medium tracking-tight sm:text-3xl">
              {service.name}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {service.description}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border/80 pt-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="mt-1 font-medium">
                  {formatServiceDuration(service.durationMinutes)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Price</dt>
                <dd className="mt-1 font-medium">
                  {formatServicePrice(service.price)}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              The backend returns a numeric amount without a currency code.
            </p>
          </div>
        </aside>
        <BookingForm service={service} />
      </div>
    </section>
  )
}
