import type { NextConfig } from "next"

import { getBackendApiBaseUrl } from "./lib/backend-api"

const backendApiBaseUrl = getBackendApiBaseUrl()

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendApiBaseUrl) {
      return []
    }

    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendApiBaseUrl}/:path*`,
      },
    ]
  },
}

export default nextConfig
