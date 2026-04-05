import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const updateTransactionSchema = z.object({
  accountId: z.string().optional(),
  date: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  amount: z.number().optional(),
  description: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  subcategory: z.string().nullable().optional(),
  merchant: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

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

    const existing = await prisma.transaction.findUnique({
      where: { id },
      include: { account: { select: { userId: true } } },
    })

    if (!existing || existing.account.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validated = updateTransactionSchema.parse(body)

    // If changing account, verify the new account belongs to the user
    if (validated.accountId) {
      const account = await prisma.account.findUnique({
        where: { id: validated.accountId },
      })
      if (!account || account.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Account not found" },
          { status: 404 }
        )
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: validated,
      include: {
        account: { select: { id: true, name: true } },
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
      },
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
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.transaction.findUnique({
      where: { id },
      include: { account: { select: { userId: true } } },
    })

    if (!existing || existing.account.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    await prisma.transaction.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Transaction deleted" })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
