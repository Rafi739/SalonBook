import { getJWTToken } from "@/lib/auth-client";
import {
  BACKEND_API_PROXY_PATH,
  BackendApiError,
  isRecord,
  readBackendErrorMessage,
  readJsonResponse,
} from "@/lib/backend-api";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string;
  role: "admin" | "customer";
  isBlocked: boolean;
  createdAt: string;
}

export interface AdminUserOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: "admin" | "customer" | "";
  blocked?: boolean | "";
  sortBy?: "name" | "email" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface AdminUserList {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

function parseUser(value: unknown): AdminUser {
  if (!isRecord(value)) throw new Error("Invalid user data.");

  if (value.role !== "admin" && value.role !== "customer") {
    throw new Error("Invalid user role.");
  }

  if (typeof value.isBlocked !== "boolean") {
    throw new Error("Invalid user blocked status.");
  }

  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.email !== "string" ||
    typeof value.createdAt !== "string"
  ) {
    throw new Error("Invalid user information.");
  }

  return {
    id: value.id,
    name: value.name,
    email: value.email,
    image: typeof value.image === "string" ? value.image : "",
    role: value.role,
    isBlocked: value.isBlocked,
    createdAt: value.createdAt,
  };
}

async function userRequest(path: string, init?: RequestInit): Promise<unknown> {
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
      readBackendErrorMessage(body) ?? "User request failed.",
    );
  }

  return body;
}

export async function getAdminUsers(
  options: AdminUserOptions = {},
): Promise<AdminUserList> {
  const params = new URLSearchParams();

  params.set("page", String(options.page ?? 1));
  params.set("limit", String(options.limit ?? 10));
  params.set("sortBy", options.sortBy ?? "createdAt");
  params.set("sortOrder", options.sortOrder ?? "desc");

  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.role) params.set("role", options.role);
  if (options.blocked !== "") {
    if (typeof options.blocked === "boolean") {
      params.set("blocked", String(options.blocked));
    }
  }

  const body = await userRequest(`/users?${params.toString()}`);

  if (!isRecord(body) || !Array.isArray(body.users) || !isRecord(body.pagination)) {
    throw new Error("Invalid users response.");
  }

  const pagination = body.pagination;

  if (
    typeof pagination.page !== "number" ||
    typeof pagination.limit !== "number" ||
    typeof pagination.total !== "number" ||
    typeof pagination.totalPages !== "number"
  ) {
    throw new Error("Invalid users pagination.");
  }

  return {
    users: body.users.map(parseUser),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasNextPage: pagination.hasNextPage === true,
      hasPreviousPage: pagination.hasPreviousPage === true,
    },
  };
}

export async function updateCustomerBlockedState(
  userId: string,
  blocked: boolean,
): Promise<AdminUser> {
  const action = blocked ? "block" : "unblock";

  const body = await userRequest(
    `/users/${encodeURIComponent(userId)}/${action}`,
    { method: "PATCH" },
  );

  if (!isRecord(body) || !body.user) {
    throw new Error("Invalid user update response.");
  }

  return parseUser(body.user);
}
