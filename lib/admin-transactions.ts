import { getJWTToken } from "@/lib/auth-client";
import {
  BACKEND_API_PROXY_PATH,
  BackendApiError,
  isRecord,
  readBackendErrorMessage,
  readJsonResponse,
} from "@/lib/backend-api";

export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded";

export interface AdminTransaction {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
  } | null;
  appointment: {
    id: string;
    appointmentDate: string;
    timeSlot: string;
    status: string;
  } | null;
}

export interface AdminTransactionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminTransactionList {
  transactions: AdminTransaction[];
  pagination: AdminTransactionPagination;
}

export interface AdminTransactionOptions {
  page?: number;
  limit?: number;
  status?: TransactionStatus;
  dateFrom?: string;
  dateTo?: string;
}

function parseTransaction(value: unknown): AdminTransaction {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.appointmentId !== "string" ||
    typeof value.amount !== "number" ||
    !Number.isFinite(value.amount) ||
    typeof value.currency !== "string" ||
    typeof value.status !== "string" ||
    !["pending", "completed", "failed", "refunded"].includes(value.status) ||
    typeof value.createdAt !== "string"
  ) {
    throw new Error("Invalid transaction data received from server.");
  }

  let customer: AdminTransaction["customer"] = null;

  if (isRecord(value.customer)) {
    if (
      typeof value.customer.id !== "string" ||
      typeof value.customer.name !== "string" ||
      typeof value.customer.email !== "string"
    ) {
      throw new Error("Invalid transaction customer data.");
    }

    customer = {
      id: value.customer.id,
      name: value.customer.name,
      email: value.customer.email,
    };
  } else if (value.customer !== null && value.customer !== undefined) {
    throw new Error("Invalid transaction customer data.");
  }

  let appointment: AdminTransaction["appointment"] = null;

  if (isRecord(value.appointment)) {
    if (
      typeof value.appointment.id !== "string" ||
      typeof value.appointment.appointmentDate !== "string" ||
      typeof value.appointment.timeSlot !== "string" ||
      typeof value.appointment.status !== "string"
    ) {
      throw new Error("Invalid transaction appointment data.");
    }

    appointment = {
      id: value.appointment.id,
      appointmentDate: value.appointment.appointmentDate,
      timeSlot: value.appointment.timeSlot,
      status: value.appointment.status,
    };
  } else if (value.appointment !== null && value.appointment !== undefined) {
    throw new Error("Invalid transaction appointment data.");
  }

  return {
    id: value.id,
    appointmentId: value.appointmentId,
    amount: value.amount,
    currency: value.currency,
    status: value.status as TransactionStatus,
    createdAt: value.createdAt,
    customer,
    appointment,
  };
}

export async function getAdminTransactions(
  options: AdminTransactionOptions = {},
): Promise<AdminTransactionList> {
  const token = await getJWTToken();
  const params = new URLSearchParams();

  params.set("page", String(options.page ?? 1));
  params.set("limit", String(options.limit ?? 20));

  if (options.status) {
    params.set("status", options.status);
  }

  if (options.dateFrom) {
    params.set("dateFrom", options.dateFrom);
  }

  if (options.dateTo) {
    params.set("dateTo", options.dateTo);
  }

  const response = await fetch(
    `${BACKEND_API_PROXY_PATH}/payments?${params.toString()}`,
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
      readBackendErrorMessage(body) ?? "Failed to load transactions.",
    );
  }

  if (
    !isRecord(body) ||
    !Array.isArray(body.transactions) ||
    !isRecord(body.pagination)
  ) {
    throw new Error("Invalid transaction list received from server.");
  }

  const pagination = body.pagination;

  const numericFields = [
    "page",
    "limit",
    "total",
    "totalPages",
  ] as const;

  for (const field of numericFields) {
    if (
      typeof pagination[field] !== "number" ||
      !Number.isFinite(pagination[field])
    ) {
      throw new Error("Invalid transaction pagination data.");
    }
  }

  if (
    typeof pagination.hasNextPage !== "boolean" ||
    typeof pagination.hasPreviousPage !== "boolean"
  ) {
    throw new Error("Invalid transaction pagination data.");
  }

  return {
    transactions: body.transactions.map(parseTransaction),
    pagination: {
      page: pagination.page as number,
      limit: pagination.limit as number,
      total: pagination.total as number,
      totalPages: pagination.totalPages as number,
      hasNextPage: pagination.hasNextPage,
      hasPreviousPage: pagination.hasPreviousPage,
    },
  };
}
