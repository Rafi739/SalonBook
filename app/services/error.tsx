"use client"

import { useEffect } from "react"

import { ServiceErrorState } from "@/components/services/service-states"

type ServicesErrorProps = {
  error: Error & { digest?: string }
  retry: () => void
}

export default function ServicesError({ error, retry }: ServicesErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return <ServiceErrorState onRetry={retry} />
}
