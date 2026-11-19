export type ServiceSortOrder = "default" | "price-asc" | "price-desc"

type ServiceSortProps = {
  value: ServiceSortOrder
  onChange: (value: ServiceSortOrder) => void
}

export function ServiceSort({ value, onChange }: ServiceSortProps) {
  function handleChange(selected: string) {
    if (
      selected === "default" ||
      selected === "price-asc" ||
      selected === "price-desc"
    ) {
      onChange(selected)
    }
  }

  return (
    <div className="w-full sm:w-56">
      <label htmlFor="service-sort" className="mb-2 block text-sm font-medium">
        Sort by price
      </label>
      <select
        id="service-sort"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="default">Default</option>
        <option value="price-asc">Low to High</option>
        <option value="price-desc">High to Low</option>
      </select>
    </div>
  )
}
