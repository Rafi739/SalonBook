
import { createAuthClient } from "better-auth/react";

const jwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
type JwtTokenResponse = { token?: unknown };

function isValidJwtToken(token: unknown): token is string {
  return (
    typeof token === "string" &&
    token.length > 0 &&
    token.trim() === token &&
    jwtPattern.test(token)
  );
}

export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;

export async function getJWTToken(): Promise<string> {
  const response = await authClient
    .$fetch<JwtTokenResponse>("/token", {
      method: "GET",
    })
    .catch(() => {
      throw new Error(
        "Failed to retrieve JWT: the authentication request failed.",
      )
    })

  if (response.error) {
    throw new Error(
      "Failed to retrieve JWT: the authentication request was rejected.",
    )
  }

  const token = response.data?.token
  if (!isValidJwtToken(token)) {
    throw new Error(
      "Failed to retrieve JWT: the response contained no valid token.",
    )
  }

  return token
}
