import { cookies } from "next/headers"

export async function fetchBackend(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("authjs.session-token") || cookieStore.get("next-auth.session-token")

  const headers = new Headers(options.headers)
  if (authCookie) {
    headers.set("Cookie", `${authCookie.name}=${authCookie.value}`)
  }

  const baseUrl = process.env.BACKEND_URL || "http://localhost:8000"

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`)
  }

  return response.json()
}
