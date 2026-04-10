import { NextResponse } from "next/server"
import { z } from "zod"
import { fetchBackend } from "@/lib/api"

const updateAccountSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  balance: z.number().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const p = await params
    const body = await request.json()
    const validated = updateAccountSchema.parse(body)

    const account = await fetchBackend(`/api/accounts/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validated),
    })

    return NextResponse.json(account)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const p = await params
    await fetchBackend(`/api/accounts/${p.id}`, { method: "DELETE" })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
