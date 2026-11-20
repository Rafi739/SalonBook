import {
  BackendApiError,
  getBackendApiBaseUrl,
  isRecord,
  readBackendErrorMessage,
  readJsonResponse,
} from "./backend-api"

export type ServiceCategory = "mens" | "womens" | "unisex"

export type Service = {
  id: string
  name: string
  category: ServiceCategory
  description: string
  durationMinutes: number
  price: number
  imageUrl: string
}

type BackendServiceCategory = "Men's" | "Women's" | "Unisex"

const serviceCategories: Record<BackendServiceCategory, ServiceCategory> = {
  "Men's": "mens",
  "Women's": "womens",
  Unisex: "unisex",
}

function isBackendServiceCategory(
  value: unknown,
): value is BackendServiceCategory {
  return value === "Men's" || value === "Women's" || value === "Unisex"
}

function parseService(value: unknown): Service {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.serviceName !== "string" ||
    !isBackendServiceCategory(value.category) ||
    typeof value.description !== "string" ||
    typeof value.price !== "number" ||
    !Number.isFinite(value.price) ||
    typeof value.duration !== "number" ||
    !Number.isSafeInteger(value.duration) ||
    typeof value.image !== "string"
  ) {
    throw new Error("The backend returned an invalid service record.")
  }

  return {
    id: value.id,
    name: value.serviceName,
    category: serviceCategories[value.category],
    description: value.description,
    durationMinutes: value.duration,
    price: value.price,
    imageUrl: value.image,
  }
}

async function fetchServiceApi(path: string): Promise<unknown> {
  const baseUrl = getBackendApiBaseUrl()
  if (!baseUrl) {
    throw new Error("Configure BACKEND_API_URL before loading backend services.")
  }

  const response = await fetch(`${baseUrl}${path}`, { cache: "no-store" })
  const body = await readJsonResponse(response)

  if (!response.ok) {
    throw new BackendApiError(
      response.status,
      readBackendErrorMessage(body) ?? "The service catalog could not be loaded."
    )
  }

  return body
}

export async function getServices(): Promise<Service[]> {
  const services: Service[] = []
  let page = 1

  while (true) {
    const result = await fetchServiceApi(
      `/services?page=${page}&limit=100&sort=price_asc`
    )

    if (
      !isRecord(result) ||
      !Array.isArray(result.services) ||
      !isRecord(result.pagination) ||
      typeof result.pagination.hasNextPage !== "boolean"
    ) {
      throw new Error("The backend returned an invalid service list.")
    }

    const serviceRecords: unknown[] = result.services
    services.push(...serviceRecords.map(parseService))

    if (!result.pagination.hasNextPage) {
      return services
    }

    page += 1
  }
}

export async function getServiceById(id: string): Promise<Service | null> {
  if (!/^[\da-f]{24}$/i.test(id)) {
    return null
  }

  let result: unknown
  try {
    result = await fetchServiceApi(`/services/${encodeURIComponent(id)}`)
  } catch (error) {
    if (error instanceof BackendApiError && error.status === 404) {
      return null
    }
    throw error
  }

  if (!isRecord(result) || !("service" in result)) {
    throw new Error("The backend returned an invalid service response.")
  }

  return result.service === null ? null : parseService(result.service)
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}
