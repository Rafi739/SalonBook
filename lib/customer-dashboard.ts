import { getJWTToken } from "@/lib/auth-client";
import {
  BACKEND_API_PROXY_PATH,
  BackendApiError,
  isRecord,
  readBackendErrorMessage,
  readJsonResponse,
} from "@/lib/backend-api";

export type CustomerAppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "rejected"
  | "completed";

export type CustomerPaymentStatus = "paid" | "unpaid";

export interface CustomerAppointment {
  id: string;
  appointmentDate: string;
  timeSlot: string;
  message: string;
  servicePrice: number;
  paymentStatus: CustomerPaymentStatus;
  status: CustomerAppointmentStatus;
  createdAt: string;
  service: {
    id: string;
    serviceName: string;
    category: string;
    duration: number;
    image: string;
  } | null;
}

export interface CustomerAppointmentList {
  appointments: CustomerAppointment[];
  total: number;
}

function parseAppointment(value: unknown): CustomerAppointment {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.appointmentDate !== "string" ||
    typeof value.timeSlot !== "string" ||
    typeof value.servicePrice !== "number" ||
    typeof value.createdAt !== "string"
  ) {
    throw new Error("Invalid appointment information.");
  }

  const validStatuses: CustomerAppointmentStatus[] = [
    "pending",
    "confirmed",
    "cancelled",
    "rejected",
    "completed",
  ];

  const validPaymentStatuses: CustomerPaymentStatus[] = [
    "paid",
    "unpaid",
  ];

  if (
    !validStatuses.includes(value.status as CustomerAppointmentStatus) ||
    !validPaymentStatuses.includes(
      value.paymentStatus as CustomerPaymentStatus,
    )
  ) {
    throw new Error("Invalid appointment status.");
  }

  let service: CustomerAppointment["service"] = null;

  if (isRecord(value.service)) {
    service = {
      id: typeof value.service.id === "string" ? value.service.id : "",
      serviceName:
        typeof value.service.serviceName === "string"
          ? value.service.serviceName
          : "Service unavailable",
      category:
        typeof value.service.category === "string"
          ? value.service.category
          : "",
      duration:
        typeof value.service.duration === "number"
          ? value.service.duration
          : 0,
      image:
        typeof value.service.image === "string"
          ? value.service.image
          : "",
    };
  }

  return {
    id: value.id,
    appointmentDate: value.appointmentDate,
    timeSlot: value.timeSlot,
    message: typeof value.message === "string" ? value.message : "",
    servicePrice: value.servicePrice,
    paymentStatus: value.paymentStatus as CustomerPaymentStatus,
    status: value.status as CustomerAppointmentStatus,
    createdAt: value.createdAt,
    service,
  };
}

export async function getMyAppointments(): Promise<CustomerAppointmentList> {
  const token = await getJWTToken();

  const response = await fetch(
    `${BACKEND_API_PROXY_PATH}/appointments/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const body = await readJsonResponse(response);

  if (!response.ok) {
    throw new BackendApiError(
      response.status,
      readBackendErrorMessage(body) ?? "Could not load appointments.",
    );
  }

  if (!isRecord(body) || !Array.isArray(body.appointments)) {
    throw new Error("Invalid appointments response.");
  }

  return {
    appointments: body.appointments.map(parseAppointment),
    total:
      isRecord(body.pagination) && typeof body.pagination.total === "number"
        ? body.pagination.total
        : body.appointments.length,
  };
}

export async function cancelMyAppointment(
  appointmentId: string,
): Promise<void> {
  const token = await getJWTToken();

  const response = await fetch(
    `${BACKEND_API_PROXY_PATH}/appointments/${encodeURIComponent(appointmentId)}/cancel`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const body = await readJsonResponse(response);

  if (!response.ok) {
    throw new BackendApiError(
      response.status,
      readBackendErrorMessage(body) ?? "Could not cancel appointment.",
    );
  }
}
