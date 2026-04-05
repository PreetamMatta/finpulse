import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

const createTransactionSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  date: z.string().transform((val) => new Date(val)),
  amount: z.number(),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().optional(),
  subcategory: z.string().optional(),
  merchant: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20")))
    const accountId = searchParams.get("accountId")
    const categoryId = searchParams.get("categoryId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "date"
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc"

    const where: Prisma.TransactionWhereInput = {
      userId: session.user.id,
    }

    if (accountId) where.accountId = accountId
    if (categoryId) where.categoryId = categoryId

    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { merchant: { contains: search } },
      ]
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, icon: true, color: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ])

    return NextResponse.json({
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
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
    const validated = createTransactionSchema.parse(body)

    // Verify the account belongs to the user
    const account = await prisma.account.findUnique({
      where: { id: validated.accountId },
    })

    if (!account || account.userId !== session.user.id) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...validated,
        userId: session.user.id,
      },
      include: {
        account: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
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
