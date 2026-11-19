type ServiceSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function ServiceSearch({ value, onChange }: ServiceSearchProps) {
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor="service-search" className="mb-2 block text-sm font-medium">
        Search services
      </label>
      <input
        id="service-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Try a haircut or styling"
        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  )
}
