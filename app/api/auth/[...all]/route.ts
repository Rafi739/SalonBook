import { toNextJsHandler } from "better-auth/next-js"

export const dynamic = "force-dynamic"

async function handleAuthRequest(request: Request) {
  const { auth } = await import("@/lib/auth")
  const { GET, POST } = toNextJsHandler(auth)

  return request.method === "GET" ? GET(request) : POST(request)
}

export { handleAuthRequest as GET, handleAuthRequest as POST }