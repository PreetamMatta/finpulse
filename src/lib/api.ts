import { auth } from "@/lib/auth"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"
// Error intentional if missing
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY as string

export async function fetchBackend(endpoint: string, options: RequestInit = {}) {
  const session = await auth()

  const headers = new Headers(options.headers)
  headers.set("X-API-Key", INTERNAL_API_KEY)

  if (session?.user?.id) {
    headers.set("X-User-Id", session.user.id)
    headers.set("X-User-Role", session.user.role ?? "USER")
  }

  if (options.body) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }))
    throw new Error(`Backend ${response.status}: ${error.detail ?? JSON.stringify(error)}`)
  }

  return response.json()
}
