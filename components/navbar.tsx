
"use client"

import { Menu, X, Search, LogOut, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "@/lib/auth-client"

const navigation = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "For Him", href: "/#for-him" },
  { label: "For Her", href: "/#for-her" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
]

const ADMIN_EMAIL = "rahumanarif739@gmail.com"

function AccountLinks({
  mobile = false,
  isPending,
  isLoggedIn,
  isAdmin,
  isLoggingOut,
  closeMenu,
  handleLogout,
}: {
  mobile?: boolean
  isPending: boolean
  isLoggedIn: boolean
  isAdmin: boolean
  isLoggingOut: boolean
  closeMenu: () => void
  handleLogout: () => void
}) {
  if (isPending) return null

  if (!isLoggedIn) {
    return (
      <>
        <Link href="/sign-in" onClick={closeMenu} className={mobile ? "rounded-full border border-border px-4 py-3 text-center text-sm font-medium" : "rounded-full px-3 py-2 text-sm font-medium hover:bg-muted"}>
          Sign in
        </Link>
        <Link href="/sign-up" onClick={closeMenu} className={mobile ? "rounded-full bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground" : "rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"}>
          Create account
        </Link>
      </>
    )
  }

  return (
    <>
      <Link href={isAdmin ? "/admin" : "/dashboard"} onClick={closeMenu} className={mobile ? "flex items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-medium" : "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium hover:bg-muted"}>
        <LayoutDashboard size={16} />
        {isAdmin ? "Admin Panel" : "My Dashboard"}
      </Link>
      <button type="button" disabled={isLoggingOut} onClick={handleLogout} className={mobile ? "flex items-center justify-center gap-2 rounded-full bg-muted px-4 py-3 text-sm font-medium disabled:opacity-50" : "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"}>
        <LogOut size={16} />
        {isLoggingOut ? "Logging out..." : "Logout"}
      </button>
    </>
  )
}
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const router = useRouter()
  const { data: sessionData, isPending } = useSession()

  const user = sessionData?.user
  const isLoggedIn = Boolean(user)
  const isAdmin =
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()

  function closeMenu() {
    setMenuOpen(false)
  }

  async function handleLogout() {
    try {
      setIsLoggingOut(true)
      await signOut()
      closeMenu()
      router.replace("/")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-md">
      <div className="site-container flex min-h-[4.75rem] items-center justify-between gap-4">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2.5"
          aria-label="SalonBook home"
        >
          <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            S.
          </span>
          <span className="font-heading text-xl font-semibold tracking-[-0.05em]">
            salonbook
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-4 xl:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <form action="/services" method="GET" className="flex items-center gap-1.5">
            <input
              name="search"
              type="search"
              placeholder="Search services..."
              aria-label="Search salon services"
              className="h-9 w-36 rounded-full border border-border bg-background px-3 text-xs outline-none focus:border-primary xl:w-40"
            />

            <select
              name="sort"
              defaultValue="default"
              aria-label="Sort services by price"
              className="h-9 max-w-28 rounded-full border border-border bg-background px-2 text-xs"
            >
              <option value="default">Sort price</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            <button
              type="submit"
              aria-label="Search services"
              className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"
            >
              <Search size={15} />
            </button>
          </form>

          <AccountLinks
            isPending={isPending}
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            isLoggingOut={isLoggingOut}
            closeMenu={closeMenu}
            handleLogout={handleLogout}
          />
        </div>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-full hover:bg-muted lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-border/70 bg-background px-5 py-5 lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}

            <form
              action="/services"
              method="GET"
              className="mt-3 grid gap-2 border-t border-border pt-4"
            >
              <input
                name="search"
                type="search"
                placeholder="Search services..."
                aria-label="Search services"
                className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
              />

              <select
                name="sort"
                defaultValue="default"
                aria-label="Sort services by price"
                className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
              >
                <option value="default">Default order</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>

              <button
                type="submit"
                onClick={closeMenu}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
              >
                <Search size={16} />
                Find services
              </button>
            </form>

            <div className="mt-3 grid gap-3 border-t border-border pt-4">
              <AccountLinks
                mobile
                isPending={isPending}
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                isLoggingOut={isLoggingOut}
                closeMenu={closeMenu}
                handleLogout={handleLogout}
              />
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}

