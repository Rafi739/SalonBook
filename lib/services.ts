export type ServiceCategory = "mens" | "womens" | "unisex"

export type Service = {
  id: string
  name: string
  category: ServiceCategory
  description: string
  durationMinutes: number
  price: {
    amount: number
    currency: string
  }
  imageUrl?: string
}

export async function getServices(): Promise<Service[]> {
  // No services API exists yet; keep the catalog empty until a verified source is available.
  return []
}

export async function getServiceById(id: string): Promise<Service | null> {
  if (!id.trim()) {
    return null
  }

  const services = await getServices()
  return services.find((service) => service.id === id) ?? null
}

export function formatServiceDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes} min`
  }

  return remainingMinutes === 0
    ? `${hours} hr`
    : `${hours} hr ${remainingMinutes} min`
}

export function formatServicePrice(price: Service["price"]): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency,
  }).format(price.amount)
}
