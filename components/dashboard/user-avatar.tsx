type UserAvatarProps = {
  name: string
  email: string
  className?: string
}

export function UserAvatar({ name, email, className = "" }: UserAvatarProps) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || email.trim().slice(0, 1).toUpperCase()

  return (
    <span
      aria-hidden="true"
      className={`grid size-10 shrink-0 place-items-center rounded-full border border-accent/50 bg-secondary text-sm font-semibold text-secondary-foreground ${className}`}
    >
      {initials}
    </span>
  )
}
