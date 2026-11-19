import Link from "next/link"

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "For Him", href: "/#for-him" },
  { label: "For Her", href: "/#for-her" },
  { label: "About us", href: "/#about" },
  { label: "Contact", href: "/#contact" },
]

const serviceLinks = [
  { label: "Men's services", href: "/#for-him" },
  { label: "Women's services", href: "/#for-her" },
  { label: "Unisex services", href: "/#services" },
]

export function Footer() {
  return (
    <footer id="contact" className="border-t border-border bg-secondary/45">
      <div className="site-container grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-10 lg:py-16">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              S.
            </span>
            <span className="font-heading text-xl font-semibold tracking-[-0.05em]">
              salonbook
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
            A thoughtful salon experience for every style, every identity, and
            every version of you.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Explore</h2>
          <ul className="mt-4 space-y-3">
            {footerLinks.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Our services</h2>
          <ul className="mt-4 space-y-3">
            {serviceLinks.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Visit us</h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Contact details coming soon
            <br />
            Opening hours coming soon
          </p>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            We&apos;re putting the finishing touches on our salon details.
          </p>
        </div>
      </div>
      <div className="border-t border-border/80">
        <div className="site-container flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SalonBook. All rights reserved.</p>
          <p>Made for everyone.</p>
        </div>
      </div>
    </footer>
  )
}
