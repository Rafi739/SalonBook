import Link from "next/link"
import { Sparkles } from "lucide-react"

export function ServiceEmptyState() {
  return (
    <div
      role="status"
      className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center"
    >
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
        <Sparkles aria-hidden="true" size={21} strokeWidth={1.5} />
      </span>
      <h2 className="mt-5 font-heading text-2xl font-medium tracking-tight">
        Our service menu is on its way
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
        The service catalog isn&apos;t connected yet. We&apos;ll share the menu
        here once verified services are available.
      </p>
    </div>
  )
}

export function ServiceNoResultsState({
  onClearFilters,
}: {
  onClearFilters: () => void
}) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center"
    >
      <h2 className="font-heading text-2xl font-medium tracking-tight">
        No services match those filters
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        Try another search or clear your filters to see the full service menu.
      </p>
      <button
        type="button"
        onClick={onClearFilters}
        className="mt-6 min-h-11 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Clear filters
      </button>
    </div>
  )
}

export function ServiceLoadingState() {
  return (
    <section aria-label="Loading services" aria-busy="true">
      <div className="site-container py-12 sm:py-16">
        <div className="animate-pulse">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="mt-4 h-10 w-2/3 max-w-lg rounded bg-muted" />
          <div className="mt-4 h-5 w-full max-w-xl rounded bg-muted" />
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border border-border/80 bg-card p-3"
            >
              <div className="aspect-[4/3] rounded-2xl bg-muted" />
              <div className="px-2 pt-5 pb-3">
                <div className="h-5 w-24 rounded bg-muted" />
                <div className="mt-5 h-6 w-2/3 rounded bg-muted" />
                <div className="mt-3 h-4 rounded bg-muted" />
                <div className="mt-2 h-4 w-4/5 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ServiceDetailsLoadingState() {
  return (
    <section
      aria-label="Loading service details"
      aria-busy="true"
      className="site-container py-12 sm:py-16"
    >
      <div className="grid animate-pulse gap-8 lg:grid-cols-2 lg:items-center">
        <div className="aspect-[4/3] rounded-3xl bg-muted" />
        <div>
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="mt-5 h-10 w-2/3 rounded bg-muted" />
          <div className="mt-5 h-5 rounded bg-muted" />
          <div className="mt-3 h-5 w-4/5 rounded bg-muted" />
          <div className="mt-8 h-20 rounded-xl bg-muted" />
        </div>
      </div>
    </section>
  )
}

type ServiceErrorStateProps = {
  onRetry: () => void
}

export function ServiceErrorState({ onRetry }: ServiceErrorStateProps) {
  return (
    <section className="site-container py-16 sm:py-24">
      <div
        role="alert"
        className="mx-auto max-w-xl rounded-2xl border border-destructive/30 bg-card px-6 py-12 text-center"
      >
        <p className="eyebrow">A small hiccup</p>
        <h1 className="mt-3 font-heading text-3xl font-medium tracking-tight">
          We couldn&apos;t load the services
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 min-h-11 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Try again
        </button>
        <Link
          href="/"
          className="ml-4 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4"
        >
          Return home
        </Link>
      </div>
    </section>
  )
}
