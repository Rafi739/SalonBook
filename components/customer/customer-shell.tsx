"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  Scissors,
  UserRound,
  Menu,
  X,
  LogOut,
  LoaderCircle,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { getJWTToken, signOut, useSession } from "@/lib/auth-client";
import {
  BACKEND_API_PROXY_PATH,
  isRecord,
  readJsonResponse,
} from "@/lib/backend-api";

type VerificationStatus =
  | "checking"
  | "authorized"
  | "unauthenticated"
  | "forbidden"
  | "error";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Appointments", href: "/dashboard/appointments", icon: CalendarDays },
  { label: "My Profile", href: "/dashboard/profile", icon: UserRound },
];

function AccessScreen({
  status,
  onRetry,
}: {
  status: VerificationStatus;
  onRetry?: () => void;
}) {
  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center gap-3 text-slate-600">
        <LoaderCircle className="size-5 animate-spin" />
        Verifying customer access...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          {status === "unauthenticated"
            ? "Sign in required"
            : status === "forbidden"
              ? "Access denied"
              : "Verification failed"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {status === "unauthenticated"
            ? "Please sign in to access your customer dashboard."
            : status === "forbidden"
              ? "Your account does not have customer access. If you are an administrator, use the admin dashboard."
              : "We could not verify your account. Please check your connection and try again."}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {status === "unauthenticated" && (
            <Link
              href="/sign-in"
              className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
          )}

          {status === "forbidden" && (
            <Link
              href="/admin"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Admin dashboard
            </Link>
          )}

          {status === "error" && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Try again
            </button>
          )}

          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-rose-600">
            Back to website
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function CustomerShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: sessionData, isPending } = useSession();

  const [status, setStatus] = useState<VerificationStatus>("checking");
  const [retryCount, setRetryCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const sessionUserId = sessionData?.user?.id;

  useEffect(() => {
    if (isPending) return;

    if (!sessionUserId) return;

    let cancelled = false;

    async function verifyCustomerAccess() {
      try {
        const token = await getJWTToken();

        const response = await fetch(`${BACKEND_API_PROXY_PATH}/auth/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          credentials: "same-origin",
        });

        const body = await readJsonResponse(response);

        if (response.status === 401) {
          if (!cancelled) setStatus("unauthenticated");
          return;
        }

        if (response.status === 403) {
          if (!cancelled) setStatus("forbidden");
          return;
        }

        if (!response.ok) {
          throw new Error("The server could not verify customer access.");
        }

        if (
          !isRecord(body) ||
          !isRecord(body.user) ||
          typeof body.user.id !== "string" ||
          body.user.role !== "customer" ||
          body.user.isBlocked === true
        ) {
          if (!cancelled) setStatus("forbidden");
          return;
        }

        if (!cancelled) setStatus("authorized");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void verifyCustomerAccess();

    return () => {
      cancelled = true;
    };
  }, [isPending, sessionUserId, retryCount]);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      const result = await signOut();

      if (result.error) {
        setStatus("error");
        return;
      }

      router.replace("/sign-in");
      router.refresh();
    } catch {
      setStatus("error");
    } finally {
      setIsSigningOut(false);
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link
        href="/dashboard"
        className="flex items-center gap-3 border-b border-slate-200 px-6 py-6"
      >
        <div className="flex size-10 items-center justify-center rounded-xl bg-rose-600 text-white">
          <Scissors className="size-5" />
        </div>
        <div>
          <span className="block text-lg font-bold text-slate-900">SalonBook</span>
          <span className="text-xs text-slate-500">Customer Portal</span>
        </div>
      </Link>

      <nav aria-label="Customer dashboard" className="flex-1 space-y-2 px-4 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-rose-50 text-rose-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <Link
          href="/services"
          className="mb-3 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Scissors className="size-5" />
          Browse Services
        </Link>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={isSigningOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60"
        >
          <LogOut className="size-5" />
          {isSigningOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );

  const displayStatus = !isPending && !sessionUserId ? "unauthenticated" : status;

  if (isPending || displayStatus !== "authorized") {
    return (
      <AccessScreen
        status={isPending ? "checking" : displayStatus}
        onRetry={() => setRetryCount((count) => count + 1)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="fixed inset-y-0 hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:flex">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-950/40"
          />
          <aside className="relative h-full w-72 max-w-[85vw] bg-white shadow-xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 z-10 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1 lg:ml-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <span className="text-sm font-semibold text-slate-800">
              Customer Dashboard
            </span>
          </div>

          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-rose-600"
          >
            Visit Website
          </Link>
        </header>

        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
