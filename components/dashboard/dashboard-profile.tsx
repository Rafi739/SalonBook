"use client"

import { Pencil, Save, X } from "lucide-react"
import { useState, type FormEvent } from "react"

import { useSession } from "@/lib/auth-client"

import { UserAvatar } from "./user-avatar"

function ProfileEditor({
  user,
}: {
  user: {
    id: string
    name: string
    email: string
  }
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [saveMessage, setSaveMessage] = useState("")

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaveMessage(
      "Profile updates are not available yet. Your changes have not been saved."
    )
  }

  function handleCancel() {
    setName(user.name)
    setEmail(user.email)
    setSaveMessage("")
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Your account</p>
        <h1 className="mt-3 font-heading text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
          My Profile
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Review the account details currently linked to your SalonBook session.
        </p>
      </header>

      <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 border-b border-border/80 pb-6 sm:flex-row sm:items-center">
          <UserAvatar
            name={user.name}
            email={user.email}
            className="size-16 text-lg"
          />
          <div className="min-w-0">
            <h2 className="truncate font-heading text-xl font-medium tracking-tight">
              {user.name || "Name not provided"}
            </h2>
            <p className="mt-1 break-all text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSave}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="profile-name"
                className="block text-sm font-medium"
              >
                Name
              </label>
              <input
                id="profile-name"
                className="auth-field"
                type="text"
                autoComplete="name"
                value={name}
                readOnly={!isEditing}
                required
                onChange={(event) => {
                  setName(event.currentTarget.value)
                  setSaveMessage("")
                }}
              />
            </div>
            <div>
              <label
                htmlFor="profile-email"
                className="block text-sm font-medium"
              >
                Email
              </label>
              <input
                id="profile-email"
                className="auth-field"
                type="email"
                autoComplete="email"
                value={email}
                readOnly={!isEditing}
                required
                onChange={(event) => {
                  setEmail(event.currentTarget.value)
                  setSaveMessage("")
                }}
              />
            </div>
          </div>

          {isEditing && (
            <div className="rounded-xl border border-accent/50 bg-secondary/50 px-4 py-3 text-sm leading-6 text-muted-foreground">
              Profile editing is available as a preview. Saving changes is not
              connected yet.
            </div>
          )}

          {saveMessage && (
            <p
              role="status"
              className="rounded-xl border border-accent/50 bg-secondary/50 px-4 py-3 text-sm leading-6 text-foreground"
            >
              {saveMessage}
            </p>
          )}

          <div className="flex flex-col gap-3 border-t border-border/80 pt-5 sm:flex-row">
            {isEditing ? (
              <>
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <Save aria-hidden="true" size={16} />
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <X aria-hidden="true" size={16} />
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSaveMessage("")
                  setIsEditing(true)
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Pencil aria-hidden="true" size={16} />
                Edit profile
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  )
}

export function DashboardProfile() {
  const { data } = useSession()
  const user = data?.user

  if (!user) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center"
      >
        Profile details are unavailable until your account session is verified.
      </div>
    )
  }

  return (
    <ProfileEditor
      key={user.id}
      user={{ id: user.id, name: user.name, email: user.email }}
    />
  )
}
