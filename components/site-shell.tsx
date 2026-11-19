"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/")

  return (
    <>
      {!isDashboard && <Navbar />}
      <main>{children}</main>
      {!isDashboard && <Footer />}
    </>
  )
}
