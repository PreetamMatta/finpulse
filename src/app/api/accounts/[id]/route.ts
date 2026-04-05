import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  type: z
    .enum([
      "CHECKING",
      "SAVINGS",
      "CREDIT_CARD",
      "INVESTMENT",
      "LOAN",
      "CASH",
      "OTHER",
    ])
    .optional(),
  institution: z.string().optional(),
  balance: z.number().optional(),
  interestRate: z.number().optional(),
  creditLimit: z.number().optional(),
  color: z.string().optional(),
})

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const account = await prisma.account.findUnique({
      where: { id },
    })

    if (!account || account.userId !== session.user.id) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.account.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    const body = await request.json()
    const validated = updateAccountSchema.parse(body)

    const account = await prisma.account.update({
      where: { id },
      data: validated,
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
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.account.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    await prisma.account.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Account deleted" })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
