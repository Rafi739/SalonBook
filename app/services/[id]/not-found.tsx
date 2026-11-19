import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ServiceNotFound() {
  return (
    <section className="site-container flex min-h-[50vh] items-center justify-center py-16">
      <div className="max-w-lg text-center">
        <p className="eyebrow">Service unavailable</p>
        <h1 className="mt-4 font-heading text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
          We couldn&apos;t find that service.
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          It may have moved, or it may not be part of our menu yet.
        </p>
        <Link
          href="/services"
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Browse services
        </Link>
      </div>
    </section>
  )
}
