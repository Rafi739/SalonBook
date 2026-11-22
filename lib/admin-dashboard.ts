
import { getJWTToken } from "@/lib/auth-client";
import {
  BACKEND_API_PROXY_PATH,
  BackendApiError,
  isRecord,
  readBackendErrorMessage,
  readJsonResponse,
} from "@/lib/backend-api";

export interface RevenueByCurrency {
  currency: string;
  amount: number;
  transactions: number;
}

export interface AdminDashboardOverview {
  totalCustomers: number;
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  rejectedAppointments: number;
  revenueByCurrency: RevenueByCurrency[];
}

function isNonNegativeNumber(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function parseRevenue(value: unknown): RevenueByCurrency[] {
  if (!Array.isArray(value)) {
    throw new Error("The dashboard returned invalid revenue data.");
  }

  return value.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.currency !== "string" ||
      !/^[A-Za-z]{3}$/.test(item.currency) ||
      !isNonNegativeNumber(item.amount) ||
      !isNonNegativeNumber(item.transactions)
    ) {
      throw new Error("The dashboard returned invalid revenue data.");
    }

    return {
      currency: item.currency.toUpperCase(),
      amount: item.amount,
      transactions: item.transactions,
    };
  });
}

function parseOverview(value: unknown): AdminDashboardOverview {
  if (!isRecord(value)) {
    throw new Error("The dashboard returned an invalid response.");
  }

  const numberFields = [
    "totalCustomers",
    "totalServices",
    "activeServices",
    "inactiveServices",
    "totalAppointments",
    "pendingAppointments",
    "confirmedAppointments",
    "completedAppointments",
    "cancelledAppointments",
    "rejectedAppointments",
  ] as const;

  for (const field of numberFields) {
    if (!isNonNegativeNumber(value[field])) {
      throw new Error("The dashboard returned incomplete statistics.");
    }
  }

  return {
    totalCustomers: value.totalCustomers as number,
    totalServices: value.totalServices as number,
    activeServices: value.activeServices as number,
    inactiveServices: value.inactiveServices as number,
    totalAppointments: value.totalAppointments as number,
    pendingAppointments: value.pendingAppointments as number,
    confirmedAppointments: value.confirmedAppointments as number,
    completedAppointments: value.completedAppointments as number,
    cancelledAppointments: value.cancelledAppointments as number,
    rejectedAppointments: value.rejectedAppointments as number,
    revenueByCurrency: parseRevenue(value.revenueByCurrency),
  };
}


export async function getAdminDashboardOverview(): Promise<AdminDashboardOverview> {
  const token = await getJWTToken();

  const response = await fetch(
    `${BACKEND_API_PROXY_PATH}/dashboard/overview`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      credentials: "same-origin",
    },
  );

  const body = await readJsonResponse(response);

  if (!response.ok) {
    const message = readBackendErrorMessage(body);

    throw new BackendApiError(
      response.status,
      message ?? "Unable to load the administrator dashboard.",
    );
  }

  if (!isRecord(body) || !isRecord(body.overview)) {
    throw new Error("The server returned an invalid dashboard response.");
  }

  return parseOverview(body.overview);
}
