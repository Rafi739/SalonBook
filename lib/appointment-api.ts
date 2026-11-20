import { getJWTToken } from "@/lib/auth-client"
import {
  BACKEND_API_PROXY_PATH,
  BackendApiError,
  isRecord,
  readBackendErrorMessage,
  readJsonResponse,
} from "@/lib/backend-api"
import type {
  AppointmentHistoryResponse,
  AppointmentServiceSummary,
  AppointmentStatus,
  AppointmentSummary,
  CustomerAppointment,
  PaymentStatus,
} from "@/lib/dashboard"

export type CreateAppointmentInput = {
  serviceId: string
  appointmentDate: string
  timeSlot: string
  message?: string
}

const appointmentStatuses = new Set<string>([
  "pending",
  "confirmed",
  "rejected",
  "cancelled",
  "completed",
])

function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return typeof value === "string" && appointmentStatuses.has(value)
}

function isPaymentStatus(value: unknown): value is PaymentStatus {
  return value === "unpaid" || value === "paid"
}

function parseServiceSummary(value: unknown): AppointmentServiceSummary {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.serviceName !== "string" ||
    (value.category !== "Men's" &&
      value.category !== "Women's" &&
      value.category !== "Unisex") ||
    typeof value.duration !== "number" ||
    typeof value.image !== "string"
  ) {
    throw new Error("The appointment service details were invalid.")
  }

  return {
    id: value.id,
    serviceName: value.serviceName,
    category: value.category,
    duration: value.duration,
    image: value.image,
  }
}

function parseCustomerAppointment(value: unknown): CustomerAppointment {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.serviceId !== "string" ||
    typeof value.customerId !== "string" ||
    typeof value.appointmentDate !== "string" ||
    typeof value.timeSlot !== "string" ||
    typeof value.message !== "string" ||
    typeof value.servicePrice !== "number" ||
    !Number.isFinite(value.servicePrice) ||
    !isPaymentStatus(value.paymentStatus) ||
    !isAppointmentStatus(value.status) ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    (value.service !== null && !isRecord(value.service))
  ) {
    throw new Error("The backend returned an invalid appointment.")
  }

  return {
    id: value.id,
    serviceId: value.serviceId,
    customerId: value.customerId,
    appointmentDate: value.appointmentDate,
    timeSlot: value.timeSlot,
    message: value.message,
    servicePrice: value.servicePrice,
    paymentStatus: value.paymentStatus,
    status: value.status,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    service: value.service === null ? null : parseServiceSummary(value.service),
  }
}

function parseAppointmentHistory(value: unknown): AppointmentHistoryResponse {
  if (
    !isRecord(value) ||
    !Array.isArray(value.appointments) ||
    !isRecord(value.pagination)
  ) {
    throw new Error("The backend returned an invalid appointment history.")
  }

  const { pagination } = value
  if (
    typeof pagination.page !== "number" ||
    typeof pagination.limit !== "number" ||
    typeof pagination.total !== "number" ||
    typeof pagination.totalPages !== "number" ||
    typeof pagination.hasNextPage !== "boolean" ||
    typeof pagination.hasPreviousPage !== "boolean"
  ) {
    throw new Error("The backend returned invalid appointment pagination.")
  }

  const records: unknown[] = value.appointments
  return {
    appointments: records.map(parseCustomerAppointment),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasNextPage: pagination.hasNextPage,
      hasPreviousPage: pagination.hasPreviousPage,
    },
  }
}

function apiErrorMessage(
  status: number,
  backendMessage: string | undefined,
  operation: "create" | "list",
) {
  switch (status) {
    case 400:
    case 422:
      return backendMessage ?? "Check the appointment details and try again."
    case 401:
      return "Your session is no longer valid. Sign in again to continue."
    case 403:
      return "Your account is not permitted to access this appointment action."
    case 404:
      return operation === "create"
        ? "This service is no longer available. Please choose another service."
        : "Your customer profile could not be found."
    case 409:
      return backendMessage ??
        "An active appointment already exists for this date and time."
    case 500:
      return "The appointment service encountered an error. Please try again later."
    default:
      return status >= 500
        ? "The appointment service is temporarily unavailable."
        : "The appointment request could not be completed."
  }
}

async function requestAppointmentApi(
  path: string,
  token: string,
  init: RequestInit,
  operation: "create" | "list",
): Promise<unknown> {
  const response = await fetch(`${BACKEND_API_PROXY_PATH}${path}`, {
    ...init,
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body === undefined ? {} : { "Content-Type": "application/json" }),
      ...init.headers,
    },
  })
  const body = await readJsonResponse(response)

  if (!response.ok) {
    throw new BackendApiError(
      response.status,
      apiErrorMessage(
        response.status,
        readBackendErrorMessage(body),
        operation,
      ),
    )
  }

  return body
}

async function getHistoryWithToken(
  token: string,
  page: number,
  limit: number,
  status?: AppointmentStatus,
): Promise<AppointmentHistoryResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  if (status !== undefined) {
    query.set("status", status)
  }

  const body = await requestAppointmentApi(
    `/appointments/me?${query.toString()}`,
    token,
    { method: "GET" },
    "list",
  )

  return parseAppointmentHistory(body)
}

export async function createCustomerAppointment(
  input: CreateAppointmentInput,
): Promise<CustomerAppointment> {
  const token = await getJWTToken()
  const message = input.message?.trim()
  const body = await requestAppointmentApi(
    "/appointments",
    token,
    {
      method: "POST",
      body: JSON.stringify({
        serviceId: input.serviceId,
        appointmentDate: input.appointmentDate,
        timeSlot: input.timeSlot,
        ...(message ? { message } : {}),
      }),
    },
    "create",
  )

  if (!isRecord(body) || !("appointment" in body)) {
    throw new Error("The backend returned an invalid booking confirmation.")
  }

  return parseCustomerAppointment(body.appointment)
}

export async function getCustomerAppointments(
  page: number,
  limit = 20,
): Promise<AppointmentHistoryResponse> {
  const token = await getJWTToken()
  return getHistoryWithToken(token, page, limit)
}

export async function getCustomerAppointmentSummary(): Promise<AppointmentSummary> {
  const token = await getJWTToken()
  const [recent, all, pending, confirmed, completed] = await Promise.all([
    getHistoryWithToken(token, 1, 3),
    getHistoryWithToken(token, 1, 1),
    getHistoryWithToken(token, 1, 1, "pending"),
    getHistoryWithToken(token, 1, 1, "confirmed"),
    getHistoryWithToken(token, 1, 1, "completed"),
  ])

  return {
    recentAppointments: recent.appointments,
    total: all.pagination.total,
    pending: pending.pagination.total,
    confirmed: confirmed.pagination.total,
    completed: completed.pagination.total,
  }
}
