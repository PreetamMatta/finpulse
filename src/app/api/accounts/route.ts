import { NextResponse } from "next/server"
import { z } from "zod"
import { fetchBackend } from "@/lib/api"

const createAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CHECKING", "SAVINGS", "CREDIT_CARD", "INVESTMENT", "LOAN", "OTHER"]),
  balance: z.number().int().default(0),
  institution: z.string().optional(),
  interestRate: z.number().optional(),
  creditLimit: z.number().int().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})

export async function GET(request: Request) {
  try {
    const accounts = await fetchBackend("/api/accounts")
    return NextResponse.json(accounts)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = createAccountSchema.parse(body)

    const account = await fetchBackend("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validated),
    })

    return NextResponse.json(account, { status: 201 })
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
