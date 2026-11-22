
export const BACKEND_API_PROXY_PATH = "/backend-api";

export class BackendApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "BackendApiError";
  }
}

export function getBackendApiBaseUrl(): string | null {
  const configuredUrl = process.env.BACKEND_API_URL?.trim();

  if (!configuredUrl) {
    return process.env.NODE_ENV === "development"
      ? "http://localhost:4000/api"
      : null;
  }

  let url: URL;

  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error("BACKEND_API_URL must be a valid URL.");
  }

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.username !== "" ||
    url.password !== "" ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    throw new Error(
      "BACKEND_API_URL must be an HTTP(S) URL without credentials or query parameters.",
    );
  }

  const isLocalhost =
    url.hostname === "localhost" || url.hostname === "127.0.0.1";

  if (
    process.env.NODE_ENV === "production" &&
    url.protocol !== "https:" &&
    !isLocalhost
  ) {
    throw new Error("BACKEND_API_URL must use HTTPS in production.");
  }

  const path = url.pathname.replace(/\/+$/, "");

  if (path !== "" && path !== "/api") {
    throw new Error(
      "BACKEND_API_URL must point to the backend origin or its /api path.",
    );
  }

  return `${url.origin}${path || "/api"}`;
}

export function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export async function readJsonResponse(
  response: Response,
): Promise<unknown> {
  try {
    const body: unknown = await response.json();
    return body;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return null;
    }

    throw error;
  }
}

export function readBackendErrorMessage(
  value: unknown,
): string | undefined {
  if (!isRecord(value) || typeof value.message !== "string") {
    return undefined;
  }

  return value.message;
}
