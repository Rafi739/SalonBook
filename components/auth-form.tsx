"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { signIn, signUp } from "@/lib/auth-client"

type AuthFormProps = {
  mode: "sign-in" | "sign-up"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSignUp = mode === "sign-up"

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email"))
    const password = String(formData.get("password"))

    try {
      const result = isSignUp
        ? await signUp.email({
            name: String(formData.get("name")),
            email,
            password,
          })
        : await signIn.email({ email, password })

      if (result.error) {
        setErrorMessage(result.error.message ?? "We couldn't complete your request.")
        return
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't reach the salon. Please try again.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="site-container flex min-h-[65vh] items-center justify-center py-14 sm:py-20">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-10">
        <p className="eyebrow">{isSignUp ? "Your next chapter" : "Welcome back"}</p>
        <h1 className="mt-3 font-heading text-3xl font-medium tracking-[-0.04em]">
          {isSignUp ? "Create your account" : "Sign in to SalonBook"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {isSignUp
            ? "Join us and make space for a little more you."
            : "Good to have you back. Sign in to continue."}
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {isSignUp && (
            <label className="block text-sm font-medium">
              Name
              <input
                className="auth-field"
                type="text"
                name="name"
                autoComplete="name"
                required
                maxLength={100}
              />
            </label>
          )}
          <label className="block text-sm font-medium">
            Email
            <input
              className="auth-field"
              type="email"
              name="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              className="auth-field"
              type="password"
              name="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </label>

          {errorMessage && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-12 w-full rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Please wait..."
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "New to SalonBook?"}{" "}
          <Link
            href={isSignUp ? "/sign-in" : "/sign-up"}
            className="font-semibold text-foreground underline decoration-accent underline-offset-4"
          >
            {isSignUp ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </section>
  )
}
