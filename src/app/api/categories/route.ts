import { NextResponse } from "next/server"
import { z } from "zod"
import { fetchBackend } from "@/lib/api"

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  icon: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  color: z.string().default("#6366f1"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = createCategorySchema.parse(body)

    const category = await fetchBackend("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validated),
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
