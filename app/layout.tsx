import { Geist, Geist_Mono } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { SiteShell } from "@/components/site-shell"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://salon-book-hazel.vercel.app"),
  title: {
    default: "SalonBook | A better kind of salon experience",
    template: "%s | SalonBook",
  },
  description:
    "Discover thoughtful hair, grooming, and self-care services for everyone at SalonBook. Explore services and book your next salon appointment online.",
  applicationName: "SalonBook",
  keywords: [
    "SalonBook",
    "unisex salon",
    "salon appointment booking",
    "hair services",
    "grooming",
    "self-care",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "SalonBook",
    title: "SalonBook | A better kind of salon experience",
    description:
      "Find your style, explore salon services, and book an appointment with SalonBook.",
  },
  twitter: {
    card: "summary",
    title: "SalonBook | A better kind of salon experience",
    description:
      "Explore thoughtful salon services and book your next appointment online.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <ThemeProvider>
          <SiteShell>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
