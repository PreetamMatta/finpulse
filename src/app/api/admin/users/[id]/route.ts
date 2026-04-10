import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { fetchBackend } from "@/lib/api"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  await fetchBackend(`/api/admin/users/${id}`, { method: "DELETE" })
  return NextResponse.json({ success: true })
}
