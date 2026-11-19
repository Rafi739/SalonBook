"use client"

import {
  ArrowLeft,
  CalendarDays,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { signOut, useSession } from "@/lib/auth-client"

import { UserAvatar } from "./user-avatar"

const dashboardLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/appointments", label: "My Appointments", icon: CalendarDays },
  { href: "/dashboard/profile", label: "My Profile", icon: UserRound },
] as const

type DashboardShellProps = {
  children: ReactNode
}

function DashboardNavigation({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav aria-label="Customer dashboard">
      <p className="px-3 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        Your account
      </p>
      <ul className="mt-3 space-y-1">
        {dashboardLinks.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-7 border-t border-border/80 pt-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.8} />
          Back to Website
        </Link>
      </div>
    </nav>
  )
}

function DashboardLoading() {
  return (
    <section
      role="status"
      aria-busy="true"
      className="mx-auto flex min-h-[65vh] max-w-7xl items-center justify-center px-5 py-16"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
        <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
        Loading your account…
      </div>
    </section>
  )
}

function SessionProblem({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="site-container py-16 sm:py-24">
      <div
        role="alert"
        className="mx-auto max-w-xl rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-sm sm:px-10"
      >
        <p className="eyebrow">Account unavailable</p>
        <h1 className="mt-3 font-heading text-3xl font-medium tracking-tight">
          We couldn&apos;t check your session
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Please try again. Your dashboard stays private until we can verify
          your account.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Try again
        </button>
      </div>
    </section>
  )
}

function SignInPrompt() {
  return (
    <section className="site-container py-16 sm:py-24">
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-sm sm:px-10">
        <p className="eyebrow">Your SalonBook account</p>
        <h1 className="mt-3 font-heading text-3xl font-medium tracking-tight">
          Sign in to view your dashboard
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Your appointments and profile are available after we verify your
          account.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/sign-in"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Create an account
          </Link>
        </div>
      </div>
    </section>
  )
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: sessionData, isPending, error, refetch } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState("")
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)
  const mobileNavigationRef = useRef<HTMLElement>(null)
  const mobileMenuCloseButtonRef = useRef<HTMLButtonElement>(null)
  const user = sessionData?.user

  useEffect(() => {
    if (!mobileMenuOpen) {
      return
    }

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    mobileMenuCloseButtonRef.current?.focus()

    function handleMobileNavigationKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false)
        return
      }

      if (event.key !== "Tab" || !mobileNavigationRef.current) {
        return
      }

      const focusableElements =
        mobileNavigationRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!firstElement || !lastElement) {
        return
      }

      if (
        event.shiftKey &&
        (document.activeElement === firstElement ||
          !mobileNavigationRef.current.contains(document.activeElement))
      ) {
        event.preventDefault()
        lastElement.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === lastElement ||
          !mobileNavigationRef.current.contains(document.activeElement))
      ) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    window.addEventListener("keydown", handleMobileNavigationKeyDown)
    return () => {
      window.removeEventListener("keydown", handleMobileNavigationKeyDown)
      if (previousFocus?.isConnected) {
        previousFocus.focus()
      }
    }
  }, [mobileMenuOpen])

  async function handleSignOut() {
    setSignOutError("")
    setIsSigningOut(true)

    try {
      const result = await signOut()
      if (result.error) {
        setSignOutError("We couldn't sign you out. Please try again.")
        return
      }

      router.replace("/sign-in")
      router.refresh()
    } catch {
      setSignOutError("We couldn't sign you out. Please try again.")
    } finally {
      setIsSigningOut(false)
    }
  }

  if (!user && isPending) {
    return <DashboardLoading />
  }

  if (!user && error) {
    return <SessionProblem onRetry={() => void refetch()} />
  }

  if (!user) {
    return <SignInPrompt />
  }

  const displayName = user.name?.trim() || user.email

  return (
    <div className="min-h-[65vh] bg-background">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
              ref={mobileMenuButtonRef}
              aria-label={mobileMenuOpen ? "Close dashboard menu" : "Open dashboard menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="dashboard-mobile-navigation"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? (
                <X aria-hidden="true" size={19} />
              ) : (
                <Menu aria-hidden="true" size={19} />
              )}
            </button>
            <Link
              href="/dashboard"
              className="flex shrink-0 items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              aria-label="SalonBook dashboard"
            >
              <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold tracking-tight text-primary-foreground">
                S.
              </span>
              <span className="font-heading text-lg font-semibold tracking-[-0.05em] sm:text-xl">
                salonbook
              </span>
            </Link>
            <span className="hidden border-l border-border pl-3 text-sm text-muted-foreground sm:block">
              Customer dashboard
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="max-w-40 truncate text-sm font-semibold">
                {displayName}
              </p>
              <p className="max-w-40 truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
            <UserAvatar name={user.name ?? ""} email={user.email} />
            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
              aria-label={isSigningOut ? "Signing out" : "Sign out"}
            >
              <LogOut aria-hidden="true" size={16} />
              <span className="hidden sm:inline">
                {isSigningOut ? "Signing out…" : "Sign out"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close dashboard navigation"
            aria-hidden="true"
            tabIndex={-1}
            className="absolute inset-0 h-full w-full bg-foreground/30"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            id="dashboard-mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
            ref={mobileNavigationRef}
            className="relative flex h-full w-[min(19rem,88vw)] flex-col border-r border-border bg-background px-5 py-6 shadow-2xl"
          >
            <div className="mb-9 flex items-center justify-between">
              <span className="font-heading text-lg font-semibold tracking-[-0.05em]">
                salonbook
              </span>
              <button
                type="button"
                aria-label="Close dashboard navigation"
                ref={mobileMenuCloseButtonRef}
                onClick={() => setMobileMenuOpen(false)}
                className="grid size-10 place-items-center rounded-full border border-border hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <DashboardNavigation
              pathname={pathname}
              onNavigate={() => setMobileMenuOpen(false)}
            />
            <div className="mt-auto flex items-center gap-3 border-t border-border pt-5">
              <UserAvatar name={user.name ?? ""} email={user.email} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-[90rem]">
        <aside className="sticky top-[4.5rem] hidden h-[calc(100vh-4.5rem)] w-64 shrink-0 flex-col border-r border-border/70 bg-card/40 px-4 py-8 lg:flex">
          <DashboardNavigation pathname={pathname} />
          <p className="mt-auto px-3 pt-8 text-xs leading-5 text-muted-foreground">
            Good care starts with making time for yourself.
          </p>
        </aside>

        <div className="min-w-0 flex-1 px-4 py-7 sm:px-7 sm:py-9 lg:px-10 lg:py-10">
          {signOutError && (
            <p
              role="alert"
              className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {signOutError}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
