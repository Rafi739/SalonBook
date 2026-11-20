"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { signIn, signUp } from "@/lib/auth-client"

type AuthFormProps = {
  mode: "sign-in" | "sign-up"
  callbackUrl?: string
}

export function AuthForm({ mode, callbackUrl }: AuthFormProps) {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordValue, setPasswordValue] = useState("")
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false)
  const isSignUp = mode === "sign-up"
  const alternateAuthPath = isSignUp ? "/sign-in" : "/sign-up"
  const query = callbackUrl ? { callbackUrl } : {}

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email"))
    const password = String(formData.get("password"))
    const confirmPassword = String(formData.get("confirmPassword"))

    if (isSignUp && password !== confirmPassword) {
      setPasswordsDoNotMatch(true)
      return
    }

    setPasswordsDoNotMatch(false)
    setIsSubmitting(true)

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

      router.push(callbackUrl ?? "/")
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
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                className="auth-field pr-16"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                minLength={8}
                required
                value={passwordValue}
                onChange={(event) => {
                  const value = event.currentTarget.value
                  setPasswordValue(value)
                  if (passwordsDoNotMatch) {
                    setPasswordsDoNotMatch(value !== confirmPasswordValue)
                  }
                }}
              />
              <button
                type="button"
                aria-label={`${showPassword ? "Hide" : "Show"} password`}
                aria-controls="password"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  className="auth-field pr-16"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmPasswordValue}
                  aria-invalid={passwordsDoNotMatch}
                  aria-describedby={
                    passwordsDoNotMatch ? "confirm-password-error" : undefined
                  }
                  onChange={(event) => {
                    const value = event.currentTarget.value
                    setConfirmPasswordValue(value)
                    if (passwordsDoNotMatch) {
                      setPasswordsDoNotMatch(value !== passwordValue)
                    }
                  }}
                />
                <button
                  type="button"
                  aria-label={`${showConfirmPassword ? "Hide" : "Show"} confirm password`}
                  aria-controls="confirm-password"
                  aria-pressed={showConfirmPassword}
                  onClick={() =>
                    setShowConfirmPassword((visible) => !visible)
                  }
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {passwordsDoNotMatch && (
                <p
                  id="confirm-password-error"
                  role="alert"
                  className="mt-2 text-sm text-destructive"
                >
                  Passwords do not match.
                </p>
              )}
            </div>
          )}

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
            href={{
              pathname: alternateAuthPath,
              query,
            }}
            className="font-semibold text-foreground underline decoration-accent underline-offset-4"
          >
            {isSignUp ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </section>
  )
}
