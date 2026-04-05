import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["INCOME", "EXPENSE"]),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  color: z.string().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      where: {
        OR: [{ userId: session.user.id }, { userId: null }],
      },
      include: {
        children: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(categories)
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
    const validated = createCategorySchema.parse(body)

    const category = await prisma.category.create({
      data: {
        ...validated,
        userId: session.user.id,
      },
      include: {
        children: true,
      },
    })

    return NextResponse.json(category, { status: 201 })
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
