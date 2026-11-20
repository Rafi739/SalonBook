import type { Metadata } from "next"

import { AuthForm } from "@/components/auth-form"
import { getSafeCallbackUrl } from "@/lib/safe-redirect"

export const metadata: Metadata = {
  title: "Create an account",
}

export default async function SignUpPage({
  searchParams,
}: PageProps<"/sign-up">) {
  const { callbackUrl } = await searchParams

  return (
    <AuthForm
      mode="sign-up"
      callbackUrl={getSafeCallbackUrl(callbackUrl)}
    />
  )
}
