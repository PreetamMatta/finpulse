"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  Upload,
  MoreHorizontal,
} from "lucide-react"

const tabs = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Add", href: "/transactions/new", icon: Plus, isAction: true },
  { label: "Import", href: "/import", icon: Upload },
  { label: "More", href: "/settings", icon: MoreHorizontal },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center justify-around border-t border-zinc-800 bg-zinc-900 px-2 pb-[env(safe-area-inset-bottom)] md:hidden">
      {tabs.map((tab) => {
        const isActive =
          !tab.isAction &&
          (pathname === tab.href || pathname.startsWith(tab.href + "/"))

        if (tab.isAction) {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center py-2"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 transition-transform active:scale-95">
                <tab.icon className="h-5 w-5" />
              </span>
            </Link>
          )
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 px-3 py-2 text-[10px] font-medium transition-colors ${
              isActive ? "text-white" : "text-zinc-500"
            }`}
          >
            <tab.icon className={`h-5 w-5 ${isActive ? "text-indigo-400" : ""}`} />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
