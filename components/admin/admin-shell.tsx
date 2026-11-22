"use client";

import {
  CalendarDays,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Scissors,
  Users,
  CreditCard,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

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

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/services", label: "Manage Services", icon: Scissors },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/transactions", label: "Transactions", icon: CreditCard },
  { href: "/admin/profile", label: "My Profile", icon: UserRound },
] as const;

function LoadingScreen() {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-5"
      role="status"
      aria-busy="true"
    >
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <LoaderCircle className="animate-spin" size={20} />
        Verifying administrator access...
      </div>
    </main>
  );
}

function AccessMessage({
  title,
  description,
  action,
  onRetry,
}: {
  title: string;
  description: string;
  action: ReactNode;
  onRetry?: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="font-heading text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/85"
            >
              Try again
            </button>
          )}
          {action}
        </div>
      </section>
    </main>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: sessionData, isPending } = useSession();

  const [status, setStatus] = useState<VerificationStatus>("checking");
  const [retryCount, setRetryCount] = useState(0);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const sessionUserId = sessionData?.user?.id ?? sessionData?.user?.email;
  const effectiveStatus: VerificationStatus =
    !isPending && !sessionUserId ? "unauthenticated" : status;

  useEffect(() => {
    if (isPending) return;

    if (!sessionUserId) return;

    let cancelled = false;

    async function verifyAdminAccess() {
      setStatus("checking");

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
          throw new Error("The server could not verify administrator access.");
        }

        if (
          !isRecord(body) ||
          !isRecord(body.user) ||
          typeof body.user.id !== "string" ||
          body.user.role !== "admin" ||
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

    void verifyAdminAccess();

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

  if (isPending || (sessionUserId && status === "checking")) {
    return <LoadingScreen />;
  }

  if (effectiveStatus === "unauthenticated") {
    return (
      <AccessMessage
        title="Sign in required"
        description="Please sign in to access the SalonBook administrator dashboard."
        action={
          <Link
            href="/sign-in"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            Sign in
          </Link>
        }
      />
    );
  }

  if (effectiveStatus === "forbidden") {
    return (
      <AccessMessage
        title="Access denied"
        description="Your account does not have administrator permission to access this area."
        action={
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold hover:bg-muted"
          >
            Go to customer dashboard
          </Link>
        }
      />
    );
  }

  if (effectiveStatus === "error") {
    return (
      <AccessMessage
        title="Verification failed"
        description="We could not verify your administrator access. Please check the connection and try again."
        onRetry={() => setRetryCount((count) => count + 1)}
        action={
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold hover:bg-muted"
          >
            Back to website
          </Link>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              S.
            </span>
            <span className="font-heading text-xl font-semibold tracking-tight">
              salonbook
            </span>
            <span className="hidden border-l border-border pl-3 text-xs font-medium text-muted-foreground sm:block">
              Administration
            </span>
          </Link>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            <LogOut size={16} />
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-[90rem]">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card/40 px-4 py-8 md:block">
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Administration
          </p>

          <nav aria-label="Admin dashboard" className="mt-4">
            <ul className="space-y-1">
              {adminLinks.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon size={18} strokeWidth={1.8} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Link
            href="/"
            className="mt-8 block border-t border-border px-3 pt-5 text-sm text-muted-foreground hover:text-foreground"
          >
            Back to website
          </Link>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-7 sm:px-7 sm:py-9 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

