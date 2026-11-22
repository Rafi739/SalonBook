import { getJWTToken } from "@/lib/auth-client";
import {
  BACKEND_API_PROXY_PATH,
  BackendApiError,
  isRecord,
  readBackendErrorMessage,
  readJsonResponse,
} from "@/lib/backend-api";

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  image: string;
  role: "admin";
  createdAt: string;
}

export interface AdminProfileUpdate {
  name?: string;
  image?: string;
}

function parseAdminProfile(value: unknown): AdminProfile {
  if (!isRecord(value)) {
    throw new Error("Invalid profile response.");
  }

  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.email !== "string" ||
    typeof value.createdAt !== "string" ||
    value.role !== "admin"
  ) {
    throw new Error("Invalid admin profile information.");
  }

  return {
    id: value.id,
    name: value.name,
    email: value.email,
    image: typeof value.image === "string" ? value.image : "",
    role: "admin",
    createdAt: value.createdAt,
  };
}

async function profileRequest(
  method: "GET" | "PATCH",
  update?: AdminProfileUpdate,
): Promise<AdminProfile> {
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

  return parseAdminProfile(body.user);
}

export async function getAdminProfile(): Promise<AdminProfile> {
  return profileRequest("GET");
}

export async function updateAdminProfile(
  update: AdminProfileUpdate,
): Promise<AdminProfile> {
  return profileRequest("PATCH", update);
}
