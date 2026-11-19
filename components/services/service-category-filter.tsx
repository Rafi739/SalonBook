import type { ServiceCategory } from "@/lib/services"

const categories: { label: string; value: ServiceCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Men's", value: "mens" },
  { label: "Women's", value: "womens" },
  { label: "Unisex", value: "unisex" },
]

type ServiceCategoryFilterProps = {
  value: ServiceCategory | "all"
  onChange: (value: ServiceCategory | "all") => void
}

export function ServiceCategoryFilter({
  value,
  onChange,
}: ServiceCategoryFilterProps) {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium">Category</span>
      <div
        role="group"
        aria-label="Filter services by category"
        className="flex flex-wrap gap-2"
      >
        {categories.map((category) => (
          <button
            key={category.value}
            type="button"
            aria-pressed={value === category.value}
            onClick={() => onChange(category.value)}
            className="min-h-10 rounded-full border border-border px-4 text-sm transition-colors hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  )
}
