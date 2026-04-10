import { auth } from "@/lib/auth"
import { fetchBackend } from "@/lib/api"
import { redirect } from "next/navigation"
import { AdminUsersClient } from "./admin-users-client"

export default async function AdminUsersPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const users = await fetchBackend("/api/admin/users")

  return <AdminUsersClient users={users} />
}
