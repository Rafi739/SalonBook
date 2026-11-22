import { getJWTToken } from "@/lib/auth-client";
import {
  BACKEND_API_PROXY_PATH,
  BackendApiError,
  isRecord,
  readBackendErrorMessage,
  readJsonResponse,
} from "@/lib/backend-api";

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  image: string;
  role: "customer";
  createdAt: string;
}

export interface CustomerProfileUpdate {
  name?: string;
  image?: string;
}

function parseCustomerProfile(value: unknown): CustomerProfile {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.email !== "string" ||
    typeof value.createdAt !== "string" ||
    value.role !== "customer"
  ) {
    throw new Error("Invalid customer profile information.");
  }

  return {
    id: value.id,
    name: value.name,
    email: value.email,
    image: typeof value.image === "string" ? value.image : "",
    role: "customer",
    createdAt: value.createdAt,
  };
}

async function profileRequest(
  method: "GET" | "PATCH",
  update?: CustomerProfileUpdate,
): Promise<CustomerProfile> {
  const token = await getJWTToken();

  const response = await fetch(`${BACKEND_API_PROXY_PATH}/users/me`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(update ? { "Content-Type": "application/json" } : {}),
    },
    ...(update ? { body: JSON.stringify(update) } : {}),
    cache: "no-store",
  });

  const body = await readJsonResponse(response);

  if (!response.ok) {
    throw new BackendApiError(
      response.status,
      readBackendErrorMessage(body) ?? "Profile request failed.",
    );
  }

  if (!isRecord(body) || !isRecord(body.user)) {
    throw new Error("Invalid profile response.");
  }

  return parseCustomerProfile(body.user);
}

export async function getCustomerProfile(): Promise<CustomerProfile> {
  return profileRequest("GET");
}

export async function updateCustomerProfile(
  update: CustomerProfileUpdate,
): Promise<CustomerProfile> {
  return profileRequest("PATCH", update);
}
