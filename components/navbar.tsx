"use client"

import { Menu, X, Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const navigation = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "For Him", href: "/#for-him" },
  { label: "For Her", href: "/#for-her" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
]

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-md">
      <div className="site-container flex min-h-[4.75rem] items-center justify-between gap-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          aria-label="SalonBook home"
          onClick={closeMenu}
        >
          <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold tracking-tight text-primary-foreground">
            S.
          </span>
          <span className="font-heading text-xl font-semibold tracking-[-0.05em]">
            salonbook
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-4 xl:flex">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <form action="/services" method="GET" className="flex items-center gap-1.5">
            <label htmlFor="global-service-search" className="sr-only">
              Search salon services
            </label>
            <input
              id="global-service-search"
              name="search"
              type="search"
              placeholder="Search services..."
              className="h-9 w-36 rounded-full border border-border bg-background px-3 text-xs outline-none focus:border-primary xl:w-40"
            />
            <label htmlFor="global-service-sort" className="sr-only">
              Sort services by price
            </label>
            <select
              id="global-service-sort"
              name="sort"
              defaultValue="default"
              className="h-9 max-w-28 rounded-full border border-border bg-background px-2 text-xs outline-none focus:border-primary"
            >
              <option value="default">Sort price</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <button
              type="submit"
              aria-label="Search services"
              className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/85"
            >
              <Search size={15} aria-hidden="true" />
            </button>
          </form>

          <Link
            href="/sign-in"
            className="rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Create account
          </Link>
        </div>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-full transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" size={21} /> : <Menu aria-hidden="true" size={21} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-border/70 bg-background px-5 py-5 sm:px-8 lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
              >
                {item.label}
              </Link>
            ))}

            <form action="/services" method="GET" className="mt-3 grid gap-2 border-t border-border pt-4">
              <label htmlFor="mobile-service-search" className="text-xs font-semibold text-muted-foreground">
                Search services
              </label>
              <input
                id="mobile-service-search"
                name="search"
                type="search"
                placeholder="Service name..."
                className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              <label htmlFor="mobile-service-sort" className="text-xs font-semibold text-muted-foreground">
                Sort by price
              </label>
              <select
                id="mobile-service-sort"
                name="sort"
                defaultValue="default"
                className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="default">Default order</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <button
                type="submit"
                onClick={closeMenu}
                className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/85"
              >
                <Search size={16} aria-hidden="true" />
                Find services
              </button>
            </form>

            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-4">
              <Link
                href="/sign-in"
                onClick={closeMenu}
                className="rounded-full border border-border px-4 py-3 text-center text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={closeMenu}
                className="rounded-full bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-ring"
              >
                Sign up
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
