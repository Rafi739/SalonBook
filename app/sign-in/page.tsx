import type { Metadata } from "next"

import { AuthForm } from "@/components/auth-form"
import { getSafeCallbackUrl } from "@/lib/safe-redirect"

export const metadata: Metadata = {
  title: "Sign in",
}

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  const { callbackUrl } = await searchParams

  return (
    <AuthForm
      mode="sign-in"
      callbackUrl={getSafeCallbackUrl(callbackUrl)}
    />
  )
}
