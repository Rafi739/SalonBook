"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { LoaderCircle } from "lucide-react"

import { getCustomerAppointments } from "@/lib/appointment-api"
import { BackendApiError } from "@/lib/backend-api"
import type { AppointmentHistoryResponse } from "@/lib/dashboard"
import { useSession } from "@/lib/auth-client"

import { AppointmentList } from "./appointment-list"

type HistoryState =
  | { kind: "loading"; requestKey: string }
  | {
      kind: "loaded"
      requestKey: string
      data: AppointmentHistoryResponse
    }
  | {
      kind: "error"
      requestKey: string
      message: string
      requiresSignIn: boolean
    }

function getHistoryError(error: unknown) {
  if (error instanceof BackendApiError) {
    return {
      message: error.message,
      requiresSignIn: error.status === 401,
    }
  }

  if (error instanceof TypeError) {
    return {
      message: "We couldn't reach the appointment service. Check your connection and try again.",
      requiresSignIn: false,
    }
  }

  return {
    message: "We couldn't load your appointment history. Please try again.",
    requiresSignIn: false,
  }
}

function AppointmentHistoryLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="flex min-h-48 items-center justify-center gap-3 text-sm text-muted-foreground"
    >
      <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
      Loading your appointments…
    </div>
  )
}

export function CustomerAppointmentHistory() {
  const { data: sessionData, isPending } = useSession()
  const [page, setPage] = useState(1)
  const [retryCount, setRetryCount] = useState(0)
  const [state, setState] = useState<HistoryState>({
    kind: "loading",
    requestKey: "",
  })
  const userId = sessionData?.user.id
  const requestKey = `${userId ?? ""}:${page}:${retryCount}`

  useEffect(() => {
    if (isPending || !userId) {
      return
    }

    let active = true
    void getCustomerAppointments(page).then(
      (data) => {
        if (active) {
          setState({ kind: "loaded", data, requestKey })
        }
      },
      (error: unknown) => {
        if (active) {
          setState({ kind: "error", requestKey, ...getHistoryError(error) })
        }
      },
    )

    return () => {
      active = false
    }
  }, [isPending, page, requestKey, userId])

  const currentState =
    state.requestKey === requestKey ? state : { kind: "loading" as const }

  if (isPending || !userId || currentState.kind === "loading") {
    return <AppointmentHistoryLoading />
  }

  if (currentState.kind === "error") {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-8 text-center"
      >
        <p className="text-sm leading-6 text-muted-foreground">
          {currentState.message}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="min-h-10 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Try again
          </button>
          {currentState.requiresSignIn ? (
            <Link
              href="/sign-in?callbackUrl=%2Fdashboard%2Fappointments"
              className="inline-flex min-h-10 items-center rounded-full border border-border px-5 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Sign in again
            </Link>
          ) : null}
        </div>
      </div>
    )
  }

  const { appointments, pagination } = currentState.data

  return (
    <div className="space-y-5">
      <AppointmentList appointments={appointments} />
      {pagination.totalPages > 1 ? (
        <nav
          aria-label="Appointment history pages"
          className="flex items-center justify-between gap-4 border-t border-border/80 pt-4"
        >
          <button
            type="button"
            disabled={!pagination.hasPreviousPage}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="min-h-10 rounded-full border border-border px-4 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <p aria-live="polite" className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <button
            type="button"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((current) => current + 1)}
            className="min-h-10 rounded-full border border-border px-4 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  )
}
