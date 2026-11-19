import Link from "next/link"

import {
  formatServiceDuration,
  formatServicePrice,
  type Service,
} from "@/lib/services"

import { ServiceImage } from "./service-image"

const categoryLabels: Record<Service["category"], string> = {
  mens: "Men's",
  womens: "Women's",
  unisex: "Unisex",
}

type ServiceCardProps = {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="group rounded-2xl border border-border/80 bg-card p-3 transition-shadow hover:shadow-md">
      <ServiceImage
        name={service.name}
        imageUrl={service.imageUrl}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="px-2 pt-5 pb-3">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
            {categoryLabels[service.category]}
          </span>
          <span className="text-sm text-muted-foreground">
            {formatServiceDuration(service.durationMinutes)}
          </span>
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <h2 className="font-heading text-xl font-medium tracking-tight">
            {service.name}
          </h2>
          <p className="shrink-0 text-base font-semibold">
            {formatServicePrice(service.price)}
          </p>
        </div>
        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">
          {service.description}
        </p>
        <Link
          href={`/services/${encodeURIComponent(service.id)}`}
          className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold underline decoration-accent underline-offset-4 transition-colors group-hover:text-muted-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          View details
        </Link>
      </div>
    </article>
  )
}
