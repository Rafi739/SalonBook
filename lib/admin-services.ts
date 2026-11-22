
import { getJWTToken } from "@/lib/auth-client";
import {
  BACKEND_API_PROXY_PATH,
  BackendApiError,
  isRecord,
  readBackendErrorMessage,
  readJsonResponse,
} from "@/lib/backend-api";
import type { Service, ServiceCategory } from "@/lib/services";

export type AdminServiceStatus = "active" | "inactive";
export type AdminServiceCategory = ServiceCategory;

export interface AdminService extends Service {
  status: AdminServiceStatus;
}

export interface AdminServiceInput {
  serviceName: string;
  category: "Men's" | "Women's" | "Unisex";
  description: string;
  price: number;
  duration: number;
  image: string;
  status?: AdminServiceStatus;
}

export interface AdminServiceListOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: ServiceCategory;
  status?: AdminServiceStatus;
  sort?: "price_asc" | "price_desc";
}

interface AdminServiceListResult {
  services: AdminService[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

function parseAdminService(value: unknown): AdminService {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.serviceName !== "string" ||
    typeof value.category !== "string" ||
    typeof value.description !== "string" ||
    typeof value.price !== "number" ||
    typeof value.duration !== "number" ||
    typeof value.image !== "string" ||
    (value.status !== "active" && value.status !== "inactive")
  ) {
    throw new Error("The backend returned an invalid admin service.");
  }

  const categories: Record<string, ServiceCategory> = {
    "Men's": "mens",
    "Women's": "womens",
    Unisex: "unisex",
  };

  const category = categories[value.category];

  if (!category) {
    throw new Error("The backend returned an unsupported service category.");
  }

  return {
    id: value.id,
    name: value.serviceName,
    category,
    description: value.description,
    price: value.price,
    durationMinutes: value.duration,
    imageUrl: value.image,
    status: value.status,
  };
}

async function adminRequest(
  path: string,
  options: RequestInit = {},
): Promise<unknown> {
  const token = await getJWTToken();

  const response = await fetch(`${BACKEND_API_PROXY_PATH}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  const body = response.status === 204 ? null : await readJsonResponse(response);

  if (!response.ok) {
    throw new BackendApiError(
      response.status,
      readBackendErrorMessage(body) ?? "The service request failed.",
    );
  }

  return body;
}

export async function getAdminServices(
  options: AdminServiceListOptions = {},
): Promise<AdminServiceListResult> {
  const params = new URLSearchParams({
    page: String(options.page ?? 1),
    limit: String(options.limit ?? 100),
    sort: options.sort ?? "price_asc",
  });

  if (options.search?.trim()) {
    params.set("search", options.search.trim());
  }

  if (options.category) {
    const categoryMap: Record<ServiceCategory, string> = {
      mens: "Men's",
      womens: "Women's",
      unisex: "Unisex",
    };
    params.set("category", categoryMap[options.category]);
  }

  if (options.status) {
    params.set("status", options.status);
  }

  const body = await adminRequest(`/services/admin?${params.toString()}`);

  if (
    !isRecord(body) ||
    !Array.isArray(body.services) ||
    !isRecord(body.pagination)
  ) {
    throw new Error("The backend returned an invalid admin service list.");
  }

  const pagination = body.pagination;

  if (
    typeof pagination.page !== "number" ||
    typeof pagination.limit !== "number" ||
    typeof pagination.total !== "number" ||
    typeof pagination.totalPages !== "number" ||
    typeof pagination.hasNextPage !== "boolean" ||
    typeof pagination.hasPreviousPage !== "boolean"
  ) {
    throw new Error("The backend returned invalid service pagination.");
  }

  return {
    services: body.services.map(parseAdminService),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasNextPage: pagination.hasNextPage,
      hasPreviousPage: pagination.hasPreviousPage,
    },
  };
}

export async function createAdminService(
  input: AdminServiceInput,
): Promise<AdminService> {
  const body = await adminRequest("/services", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!isRecord(body) || !("service" in body)) {
    throw new Error("The backend returned an invalid created service.");
  }

  return parseAdminService(body.service);
}

export async function updateAdminService(
  id: string,
  input: Partial<AdminServiceInput>,
): Promise<AdminService> {
  const body = await adminRequest(`/services/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  if (!isRecord(body) || !("service" in body)) {
    throw new Error("The backend returned an invalid updated service.");
  }

  return parseAdminService(body.service);
}

export async function updateAdminServiceStatus(
  id: string,
  status: AdminServiceStatus,
): Promise<AdminService> {
  const body = await adminRequest(
    `/services/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );

  if (!isRecord(body) || !("service" in body)) {
    throw new Error("The backend returned an invalid service status.");
  }

  return parseAdminService(body.service);
}

export async function deleteAdminService(id: string): Promise<void> {
  await adminRequest(`/services/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
