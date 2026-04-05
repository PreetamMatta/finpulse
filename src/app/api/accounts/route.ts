import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const createAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum([
    "CHECKING",
    "SAVINGS",
    "CREDIT_CARD",
    "INVESTMENT",
    "LOAN",
    "OTHER",
  ]),
  institution: z.string().optional(),
  balance: z.number().default(0),
  interestRate: z.number().optional(),
  creditLimit: z.number().optional(),
  color: z.string().default("#6366f1"),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(accounts)
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = createAccountSchema.parse(body)

    const account = await prisma.account.create({
      data: {
        ...validated,
        userId: session.user.id,
      },
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
