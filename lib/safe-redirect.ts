export function getSafeCallbackUrl(value: unknown): string | undefined {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f]/.test(value)
  ) {
    return undefined
  }

  try {
    const url = new URL(value, "http://salonbook.local")
    if (url.origin !== "http://salonbook.local") {
      return undefined
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return undefined
  }
}
