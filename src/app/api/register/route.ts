import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // In our new architecture, registration could happen directly against FastAPI,
    // or proxied here. Let's proxy to the FastAPI backend.

    // Note: Since register doesn't require admin role for self-registration,
    // we should create a public register endpoint in FastAPI.
    // For now, let's just make the request to our admin create user endpoint
    // and assume the backend handles public registration or we just hit it.

    // Actually, in the main.py we only added /api/admin/users which requires admin.
    // Let's call a new public endpoint /api/register on the backend.

    const baseUrl = process.env.BACKEND_URL || "http://localhost:8000"
    const res = await fetch(`${baseUrl}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        name: body.name,
      }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      return NextResponse.json({ error: errorData.detail || "Registration failed" }, { status: res.status })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
