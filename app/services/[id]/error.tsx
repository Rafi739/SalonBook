"use client"

import { useEffect } from "react"

import { ServiceErrorState } from "@/components/services/service-states"

type ServiceDetailsErrorProps = {
  error: Error & { digest?: string }
  retry: () => void
}

export default function ServiceDetailsError({
  error,
  retry,
}: ServiceDetailsErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return <ServiceErrorState onRetry={retry} />
}
