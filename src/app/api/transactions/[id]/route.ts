import { NextResponse } from "next/server"
import { z } from "zod"
import { fetchBackend } from "@/lib/api"

const updateTransactionSchema = z.object({
  accountId: z.string().optional(),
  date: z.string().transform((val) => new Date(val).toISOString()).optional(),
  amount: z.number().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  subcategory: z.string().optional().nullable(),
  merchant: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const p = await params
    const body = await request.json()
    const validated = updateTransactionSchema.parse(body)

    const transaction = await fetchBackend(`/api/transactions/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validated),
    })

    return NextResponse.json(transaction)
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
    await fetchBackend(`/api/transactions/${p.id}`, { method: "DELETE" })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
