import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { ServiceImage } from "@/components/services/service-image"
import {
  formatServiceDuration,
  formatServicePrice,
  getServiceById,
} from "@/lib/services"

export const metadata: Metadata = {
  title: "Service details",
}

const categoryLabels = {
  mens: "Men's",
  womens: "Women's",
  unisex: "Unisex",
} as const

export default async function ServiceDetailsPage({
  params,
}: PageProps<"/services/[id]">) {
  const { id } = await params
  const service = await getServiceById(id)

  if (!service) {
    notFound()
  }

  return (
    <section className="site-container py-10 sm:py-14 lg:py-20">
      <Link
        href="/services"
        className="inline-flex min-h-10 items-center text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        Back to all services
      </Link>
      <div className="mt-7 grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
        <ServiceImage
          name={service.name}
          imageUrl={service.imageUrl}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div>
          <span className="inline-flex rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
            {categoryLabels[service.category]}
          </span>
          <h1 className="mt-5 font-heading text-4xl leading-tight font-medium tracking-[-0.05em] sm:text-5xl">
            {service.name}
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            {service.description}
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div>
              <dt className="text-sm text-muted-foreground">Duration</dt>
              <dd className="mt-1 font-medium">
                {formatServiceDuration(service.durationMinutes)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Price</dt>
              <dd className="mt-1 font-medium">
                {formatServicePrice(service.price)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
