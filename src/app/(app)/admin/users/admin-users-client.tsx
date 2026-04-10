"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
}

export function AdminUsersClient({ users }: { users: AdminUser[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(userId: string, email: string) {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return
    setDeleting(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete user")
      router.refresh()
    } catch (err) {
      alert("Failed to delete user. Please try again.")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="flex-1 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Admin — Manage Users</h1>
          <p className="text-zinc-400 mt-2">View and manage all users in the system.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-400 bg-zinc-900/50 border-b border-zinc-800 uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-800/50">
                <td className="px-6 py-4 font-medium text-zinc-200">{user.email}</td>
                <td className="px-6 py-4 text-zinc-400">{user.name ?? "—"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 text-xs rounded-full border ${
                      user.role === "ADMIN"
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : "bg-zinc-800 text-zinc-300 border-zinc-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(user.id, user.email)}
                    disabled={deleting === user.id}
                    className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting === user.id ? "Deleting…" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
