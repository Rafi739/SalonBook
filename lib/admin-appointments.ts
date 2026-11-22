import { getJWTToken } from "@/lib/auth-client";
import {
  BACKEND_API_PROXY_PATH,
  BackendApiError,
  isRecord,
  readBackendErrorMessage,
  readJsonResponse,
} from "@/lib/backend-api";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed";

export type AppointmentPaymentStatus = "paid" | "unpaid";

export interface AdminAppointment {
  id: string;
  appointmentDate: string;
  timeSlot: string;
  message: string;
  servicePrice: number;
  paymentStatus: AppointmentPaymentStatus;
  status: AppointmentStatus;
  createdAt: string;
  customer: {
    name: string;
    email: string;
  } | null;
  service: {
    serviceName: string;
    category: string;
    duration: number;
  } | null;
}

export interface AppointmentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminAppointmentList {
  appointments: AdminAppointment[];
  pagination: AppointmentPagination;
}

export interface AdminAppointmentOptions {
  page?: number;
  limit?: number;
  status?: AppointmentStatus | "";
  paymentStatus?: AppointmentPaymentStatus | "";
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "appointmentDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new Error(`Invalid appointment data: ${field}`);
  }
  return value;
}

function requiredNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Invalid appointment data: ${field}`);
  }
  return value;
}

function parseAppointment(value: unknown): AdminAppointment {
  if (!isRecord(value)) {
    throw new Error("Invalid appointment data.");
  }

  const status = requiredString(value.status, "status");
  const paymentStatus = requiredString(value.paymentStatus, "paymentStatus");

  if (
    !["pending", "confirmed", "rejected", "cancelled", "completed"].includes(status) ||
    !["paid", "unpaid"].includes(paymentStatus)
  ) {
    throw new Error("Invalid appointment status.");
  }

  let customer: AdminAppointment["customer"] = null;

  if (isRecord(value.customer)) {
    customer = {
      name: requiredString(value.customer.name, "customer.name"),
      email: requiredString(value.customer.email, "customer.email"),
    };
  }

  let service: AdminAppointment["service"] = null;

  if (isRecord(value.service)) {
    service = {
      serviceName: requiredString(value.service.serviceName, "service.serviceName"),
      category: requiredString(value.service.category, "service.category"),
      duration: requiredNumber(value.service.duration, "service.duration"),
    };
  }

  return {
    id: requiredString(value.id, "id"),
    appointmentDate: requiredString(value.appointmentDate, "appointmentDate"),
    timeSlot: requiredString(value.timeSlot, "timeSlot"),
    message: typeof value.message === "string" ? value.message : "",
    servicePrice: requiredNumber(value.servicePrice, "servicePrice"),
    paymentStatus: paymentStatus as AppointmentPaymentStatus,
    status: status as AppointmentStatus,
    createdAt: requiredString(value.createdAt, "createdAt"),
    customer,
    service,
  };
}

function parsePagination(value: unknown): AppointmentPagination {
  if (!isRecord(value)) {
    throw new Error("Invalid appointment pagination.");
  }

  return {
    page: requiredNumber(value.page, "pagination.page"),
    limit: requiredNumber(value.limit, "pagination.limit"),
    total: requiredNumber(value.total, "pagination.total"),
    totalPages: requiredNumber(value.totalPages, "pagination.totalPages"),
    hasNextPage: value.hasNextPage === true,
    hasPreviousPage: value.hasPreviousPage === true,
  };
}

async function authenticatedRequest(
  path: string,
  init?: RequestInit,
): Promise<unknown> {
  const token = await getJWTToken();

  const response = await fetch(`${BACKEND_API_PROXY_PATH}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  const body = await readJsonResponse(response);

  if (!response.ok) {
    throw new BackendApiError(
      response.status,
      readBackendErrorMessage(body) ?? "Appointment request failed.",
    );
  }

  return body;
}

export async function getAdminAppointments(
  options: AdminAppointmentOptions = {},
): Promise<AdminAppointmentList> {
  const params = new URLSearchParams();

  params.set("page", String(options.page ?? 1));
  params.set("limit", String(options.limit ?? 10));
  params.set("sortBy", options.sortBy ?? "appointmentDate");
  params.set("sortOrder", options.sortOrder ?? "desc");

  if (options.status) params.set("status", options.status);
  if (options.paymentStatus) params.set("paymentStatus", options.paymentStatus);
  if (options.dateFrom) params.set("dateFrom", options.dateFrom);
  if (options.dateTo) params.set("dateTo", options.dateTo);

  const body = await authenticatedRequest(`/appointments?${params.toString()}`);

  if (!isRecord(body) || !Array.isArray(body.appointments)) {
    throw new Error("Invalid appointments response from server.");
  }

  return {
    appointments: body.appointments.map(parseAppointment),
    pagination: parsePagination(body.pagination),
  };
}

export async function updateAdminAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<AdminAppointment> {
  const body = await authenticatedRequest(
    `/appointments/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );

  if (!isRecord(body) || !body.appointment) {
    throw new Error("Invalid appointment update response.");
  }

  return parseAppointment(body.appointment);
}
