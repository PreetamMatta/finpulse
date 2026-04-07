import { NextResponse } from "next/server"
import { z } from "zod"
import { fetchBackend } from "@/lib/api"

const createTransactionSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  date: z.string().transform((val) => new Date(val).toISOString()),
  amount: z.number(),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().optional(),
  subcategory: z.string().optional(),
  merchant: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = createTransactionSchema.parse(body)

    const transaction = await fetchBackend("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validated),
    })

    return NextResponse.json(transaction, { status: 201 })
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
