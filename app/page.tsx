import Link from "next/link"

const services = [
  {
    number: "01",
    title: "Hair, your way",
    description:
      "Thoughtful cuts, styling, and color designed around your hair and the way you like to wear it.",
    label: "For every texture",
  },
  {
    number: "02",
    title: "The grooming edit",
    description:
      "Fresh fades, classic cuts, and the details that help you feel put together.",
    label: "Made personal",
  },
  {
    number: "03",
    title: "A little reset",
    description:
      "Make room in your day for care, calm, and a moment that is just yours.",
    label: "Come as you are",
  },
]

export default function Home() {
  return (
    <>
      <section className="site-container py-12 sm:py-16 lg:py-20">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#292722] px-7 py-14 text-[#f8f4eb] sm:px-12 sm:py-20 lg:min-h-[530px] lg:px-20 lg:py-24">
          <div
            aria-hidden="true"
            className="absolute -top-32 -right-20 -z-10 size-[30rem] rounded-full border border-[#d6bb84]/25 sm:size-[38rem]"
          />
          <div
            aria-hidden="true"
            className="absolute top-12 -right-12 -z-10 size-[24rem] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(206,177,125,0.28),rgba(83,77,64,0.14)_48%,transparent_70%)] sm:right-0 sm:size-[34rem]"
          />
          <div className="max-w-2xl">
            <p className="mb-6 text-xs font-semibold tracking-[0.23em] text-[#d6bb84] uppercase">
              Good hair. Good energy. All yours.
            </p>
            <h1 className="font-heading text-5xl leading-[1.04] font-medium tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Your chair.
              <br />
              Your kind of <span className="text-[#d6bb84] italic">care.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#eee8dc]/75 sm:text-lg">
              A modern salon experience made for everyone. Find your style, take
              a breath, and leave feeling more like yourself.
            </p>
            <Link
              href="/services"
              className="mt-9 inline-flex min-h-12 items-center justify-center rounded-full bg-[#d6bb84] px-6 text-sm font-semibold text-[#292722] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d6bb84]"
            >
              Explore our services
            </Link>
          </div>
          <div className="mt-12 flex items-center gap-3 text-xs tracking-wide text-[#eee8dc]/65 sm:mt-16">
            <span className="h-px w-9 bg-[#d6bb84]/70" />
            A welcoming space for every identity and every style
          </div>
        </div>
      </section>

      <section id="services" className="site-container scroll-mt-24 py-16 sm:py-24">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">A good place to begin</p>
            <h2 className="section-heading mt-4 max-w-xl">
              Care that feels like it fits.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            No one-size-fits-all. Just considered services, good conversation,
            and a little more time for you.
          </p>
        </div>
        <Link
          href="/services"
          className="mt-6 inline-flex min-h-10 items-center text-sm font-semibold underline decoration-accent underline-offset-4 hover:text-muted-foreground"
        >
          Browse the service menu
        </Link>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.number}
              className="flex min-h-64 flex-col rounded-2xl border border-border/80 bg-card p-6 sm:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-[0.16em] text-muted-foreground">
                  {service.number}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1.5 text-xs text-secondary-foreground">
                  {service.label}
                </span>
              </div>
              <h3 className="mt-9 font-heading text-2xl font-medium tracking-tight">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-secondary/55">
        <div className="site-container grid gap-5 py-16 sm:grid-cols-2 sm:py-20">
          <article
            id="for-him"
            className="scroll-mt-28 rounded-2xl border border-border/70 bg-background/75 p-7 sm:p-9"
          >
            <p className="eyebrow">For him</p>
            <h2 className="mt-4 font-heading text-3xl font-medium tracking-[-0.04em]">
              Your style, your rules.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              From a clean-up to a whole new look, find care that starts with
              what makes you feel good.
            </p>
            <Link
              href="#contact"
              className="mt-6 inline-flex min-h-10 items-center text-sm font-semibold underline decoration-accent underline-offset-4 hover:text-muted-foreground"
            >
              Ask us about services
            </Link>
          </article>
          <article
            id="for-her"
            className="scroll-mt-28 rounded-2xl border border-border/70 bg-background/75 p-7 sm:p-9"
          >
            <p className="eyebrow">For her</p>
            <h2 className="mt-4 font-heading text-3xl font-medium tracking-[-0.04em]">
              A look that feels like you.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Explore cuts, color, and styling with a team who listens first
              and makes space for your individuality.
            </p>
            <Link
              href="#contact"
              className="mt-6 inline-flex min-h-10 items-center text-sm font-semibold underline decoration-accent underline-offset-4 hover:text-muted-foreground"
            >
              Ask us about services
            </Link>
          </article>
        </div>
      </section>

      <section id="about" className="site-container scroll-mt-24 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">A salon for all of us</p>
          <h2 className="section-heading mt-4">
            Good care has no dress code.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            SalonBook is built around a simple idea: everyone deserves to feel
            welcome, understood, and at home in the salon chair. Come as you are.
            We&apos;ll take it from there.
          </p>
        </div>
      </section>
    </>
  )
}
